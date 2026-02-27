import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BrandingSettings {
    primaryColorRal: string;
    signageText: string;
    secondaryColorRal: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface User {
    id: Principal;
    displayName: string;
    createdAt: Time;
    subscriptionTier: SubscriptionTier;
    email: string;
    stripeCustomerId?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface EngineeringInputs {
    windSpeed: bigint;
    liveLoad: bigint;
    seismicZone: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Project {
    id: bigint;
    status: ProjectStatus;
    engineeringInputs: EngineeringInputs;
    ownerId: Principal;
    name: string;
    createdAt: Time;
    uploadedFileName: string;
    updatedAt: Time;
    erectionDataJSON?: string;
    brandingSettings: BrandingSettings;
}
export interface UserProfile {
    displayName: string;
    email: string;
}
export enum ProjectStatus {
    queued = "queued",
    processed = "processed",
    processing = "processing",
    failed = "failed"
}
export enum SubscriptionTier {
    pro = "pro",
    free = "free"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProject(name: string, uploadedFileName: string, engineeringInputs: EngineeringInputs, brandingSettings: BrandingSettings): Promise<bigint>;
    deleteProject(projectId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: bigint): Promise<Project>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUser(userId: Principal): Promise<User>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listProjectsByOwner(ownerId: Principal): Promise<Array<Project>>;
    registerUser(displayName: string, email: string): Promise<User>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveErectionData(projectId: bigint, dataJSON: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setStripeCustomerId(userId: Principal, customerId: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBrandingSettings(projectId: bigint, settings: BrandingSettings): Promise<void>;
    updateEngineeringInputs(projectId: bigint, inputs: EngineeringInputs): Promise<void>;
    updateProjectStatus(projectId: bigint, status: ProjectStatus): Promise<void>;
    updateSubscriptionTier(userId: Principal, tier: SubscriptionTier): Promise<void>;
}
