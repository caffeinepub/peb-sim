import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type ProjectStatus = {
    #queued;
    #processing;
    #processed;
    #failed;
  };

  type OldProject = {
    id : Nat;
    ownerId : Principal;
    name : Text;
    status : ProjectStatus;
    uploadedFileName : Text;
    erectionDataJSON : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type OldUser = {
    id : Principal;
    displayName : Text;
    email : Text;
    subscriptionTier : SubscriptionTier;
    stripeCustomerId : ?Text;
    createdAt : Time.Time;
  };

  type SubscriptionTier = {
    #free;
    #pro;
  };

  type OldActor = {
    nextProjectId : Nat;
    users : Map.Map<Principal, OldUser>;
    projects : Map.Map<Nat, OldProject>;
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

  type NewActor = {
    nextProjectId : Nat;
    users : Map.Map<Principal, OldUser>;
    projects : Map.Map<Nat, NewProject>;
  };

  type NewProject = {
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

  public func run(old : OldActor) : NewActor {
    let newProjects = old.projects.map<Nat, OldProject, NewProject>(
      func(_id, oldProject) {
        {
          oldProject with
          engineeringInputs = {
            windSpeed = 0;
            seismicZone = "Unknown";
            liveLoad = 0;
          };
          brandingSettings = {
            signageText = "Default";
            primaryColorRal = "RAL 9001";
            secondaryColorRal = "RAL 9001";
          };
        };
      }
    );
    {
      old with
      projects = newProjects;
    };
  };
};

