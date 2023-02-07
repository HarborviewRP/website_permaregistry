export interface User {
	accent_color: string;
	avatar: string;
	banner: string;
	banner_color: string;
	discriminator: string;
	email: string;
	flags: number;
	id: string;
	isAdmin: boolean;
	isModerator: boolean;
	locale: string;
	mfa_enabled: boolean;
	premium_type: number;
	public_flags: number;
	token: string;
	username: string;
	verified: boolean;
}

export interface UserData {
	id: string;
	name: string;
	discriminator: string;
	avatar: string;
	banner?: string;
	developer: boolean;
	moderator: boolean;
	botModerator: boolean;
	honorable: boolean;
}


export interface PageProps {
	user?: User;
}

export enum ACCESS_LEVEL {
	VISITOR = 0,
	FTA = 1,
	FTO = 2,
	ADMIN = 3,
}

export enum APP_INTERVIEW_STATUS {
	PENDING = 0,
	PASSED = 1,
	FAILED = 2,
}

export interface Appllication {
	id: string;
	discordId: string;
	status: number;
	claimedById: string | undefined;
	notes: string | undefined;
}
