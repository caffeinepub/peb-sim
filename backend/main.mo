import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

(with migration = Migration.run)
actor {
  // Types
  public type ProjectStatus = {
    #queued;
    #processing;
    #processed;
    #failed;
  };

  public type SubscriptionTier = {
    #free;
    #pro;
  };

  public type EngineeringInputs = {
    windSpeed : Nat;
    seismicZone : Text;
    liveLoad : Nat;
  };

  public type BrandingSettings = {
    signageText : Text;
    primaryColorRal : Text;
    secondaryColorRal : Text;
  };

  public type Project = {
    id : Nat;
    ownerId : Principal;
    name : Text;
    status : ProjectStatus;
    uploadedFileName : Text;
    erectionDataJSON : ?Text;
    engineeringInputs : EngineeringInputs;
    brandingSettings : BrandingSettings;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type User = {
    id : Principal;
    displayName : Text;
    email : Text;
    subscriptionTier : SubscriptionTier;
    stripeCustomerId : ?Text;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    displayName : Text;
    email : Text;
  };

  // State
  var nextProjectId = 1;
  let users = Map.empty<Principal, User>();
  let projects = Map.empty<Nat, Project>();

  // Stripe configuration state
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Include authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func ensureAuthenticatedOrTrap(caller : Principal) {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#guest) { Runtime.trap("Unauthorized: Only authenticated users can perform this action") };
      case (_) {};
    };
  };

  // ---- UserProfile functions required by the frontend ----

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) {
        ?{
          displayName = user.displayName;
          email = user.email;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let existing = users.get(caller);
    let now = Time.now();
    let updatedUser : User = switch (existing) {
      case (null) {
        {
          id = caller;
          displayName = profile.displayName;
          email = profile.email;
          subscriptionTier = #free;
          stripeCustomerId = null;
          createdAt = now;
        };
      };
      case (?user) {
        {
          user with
          displayName = profile.displayName;
          email = profile.email;
        };
      };
    };
    users.add(caller, updatedUser);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?u) {
        ?{
          displayName = u.displayName;
          email = u.email;
        };
      };
    };
  };

  // ---- User functions ----

  public shared ({ caller }) func registerUser(displayName : Text, email : Text) : async User {
    ensureAuthenticatedOrTrap(caller);

    let newUser : User = {
      id = caller;
      displayName;
      email;
      subscriptionTier = #free;
      stripeCustomerId = null;
      createdAt = Time.now();
    };
    users.add(caller, newUser);
    newUser;
  };

  public query ({ caller }) func getUser(userId : Principal) : async User {
    ensureAuthenticatedOrTrap(caller);

    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own user record");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func updateSubscriptionTier(userId : Principal, tier : SubscriptionTier) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update subscriptions");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        let updatedUser = {
          user with
          subscriptionTier = tier;
        };
        users.add(userId, updatedUser);
      };
    };
  };

  public shared ({ caller }) func setStripeCustomerId(userId : Principal, customerId : Text) : async () {
    ensureAuthenticatedOrTrap(caller);

    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own customer ID");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        let updatedUser = {
          user with
          stripeCustomerId = ?customerId;
        };
        users.add(userId, updatedUser);
      };
    };
  };

  // ---- Project functions ----

  public shared ({ caller }) func createProject(
    name : Text,
    uploadedFileName : Text,
    engineeringInputs : EngineeringInputs,
    brandingSettings : BrandingSettings,
  ) : async Nat {
    ensureAuthenticatedOrTrap(caller);

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?user) {
        if (user.subscriptionTier == #free) {
          let ownerProjects = projects.values().toArray().filter(func(p : Project) : Bool { p.ownerId == caller });
          if (ownerProjects.size() >= 2) {
            Runtime.trap("Free tier limit reached: upgrade to Pro for unlimited projects");
          };
        };
      };
    };

    let id = nextProjectId;
    nextProjectId += 1;

    let newProject : Project = {
      id;
      ownerId = caller;
      name;
      status = #queued;
      uploadedFileName;
      erectionDataJSON = null;
      engineeringInputs;
      brandingSettings;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    projects.add(id, newProject);
    id;
  };

  public query ({ caller }) func getProject(id : Nat) : async Project {
    ensureAuthenticatedOrTrap(caller);

    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (caller != project.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own projects");
        };
        project;
      };
    };
  };

  public query ({ caller }) func listProjectsByOwner(ownerId : Principal) : async [Project] {
    ensureAuthenticatedOrTrap(caller);

    if (caller != ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own projects");
    };

    projects.values().toArray().filter(func(p : Project) : Bool { p.ownerId == ownerId });
  };

  public shared ({ caller }) func updateProjectStatus(projectId : Nat, status : ProjectStatus) : async () {
    ensureAuthenticatedOrTrap(caller);

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (caller != project.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };
        let updatedProject = {
          project with
          status;
          updatedAt = Time.now();
        };
        projects.add(projectId, updatedProject);
      };
    };
  };

  public shared ({ caller }) func saveErectionData(projectId : Nat, dataJSON : Text) : async () {
    ensureAuthenticatedOrTrap(caller);

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (caller != project.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };
        let updatedProject = {
          project with
          erectionDataJSON = ?dataJSON;
          updatedAt = Time.now();
        };
        projects.add(projectId, updatedProject);
      };
    };
  };

  public shared ({ caller }) func updateEngineeringInputs(
    projectId : Nat,
    inputs : EngineeringInputs,
  ) : async () {
    ensureAuthenticatedOrTrap(caller);

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (caller != project.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };
        let updatedProject = {
          project with
          engineeringInputs = inputs;
          updatedAt = Time.now();
        };
        projects.add(projectId, updatedProject);
      };
    };
  };

  public shared ({ caller }) func updateBrandingSettings(
    projectId : Nat,
    settings : BrandingSettings,
  ) : async () {
    ensureAuthenticatedOrTrap(caller);

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (caller != project.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };
        let updatedProject = {
          project with
          brandingSettings = settings;
          updatedAt = Time.now();
        };
        projects.add(projectId, updatedProject);
      };
    };
  };

  public shared ({ caller }) func deleteProject(projectId : Nat) : async () {
    ensureAuthenticatedOrTrap(caller);

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        if (caller != project.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own projects");
        };
        projects.remove(projectId);
      };
    };
  };

  // ---- Stripe / Payment functions ----

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};

