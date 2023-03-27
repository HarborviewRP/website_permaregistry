import { DISCORD, User } from "src/types"

export const isStaff = (user: User) => {
    if (!user) return false;
    return user.roles.includes(DISCORD.STAFF_ROLE_ID) || user.access_level > 0;
}

export const isAdmin = (user: User) => {
    return user.access_level > 0;
}