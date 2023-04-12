import { DISCORD, User } from "src/types"

export const isStaff = (user: User) => {
    if (!user) return false;
    if (user.access_level > 0) return true;
    if (!user.roles) return false;
    return user.roles.includes(DISCORD.STAFF_ROLE_ID);
}

export const isAdmin = (user: User) => {
    return user?.access_level > 0;
}