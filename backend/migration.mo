import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type ProjectStatus = {
    #queued;
    #processing;
    #processed;
    #failed;
  };

  type SubscriptionTier = {
    #free;
    #pro;
  };

  type EngineeringInputs = {
    windSpeed : Nat;
    seismicZone : Text;
    liveLoad : Nat;
  };

  type BrandingSettings = {
    signageText : Text;
    primaryColorRal : Text;
    secondaryColorRal : Text;
  };

  type Project = {
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

  type User = {
    id : Principal;
    displayName : Text;
    email : Text;
    subscriptionTier : SubscriptionTier;
    stripeCustomerId : ?Text;
    createdAt : Time.Time;
  };

  type SharedLink = {
    token : Text;
    projectId : Nat;
    ownerPrincipal : Principal;
    createdAt : Time.Time;
  };

  type Comment = {
    id : Nat;
    projectId : Nat;
    author : Principal;
    elementId : Text;
    position : { x : Float; y : Float; z : Float };
    text : Text;
    createdAt : Time.Time;
  };

  type OldActor = {
    nextProjectId : Nat;
    users : Map.Map<Principal, User>;
    projects : Map.Map<Nat, Project>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  type NewActor = {
    nextSharedLinkId : Nat;
    sharedLinks : Map.Map<Text, SharedLink>;
    nextCommentId : Nat;
    comments : Map.Map<Nat, Comment>;
    nextProjectId : Nat;
    users : Map.Map<Principal, User>;
    projects : Map.Map<Nat, Project>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextSharedLinkId = 1;
      sharedLinks = Map.empty<Text, SharedLink>();
      nextCommentId = 1;
      comments = Map.empty<Nat, Comment>();
    };
  };
};
