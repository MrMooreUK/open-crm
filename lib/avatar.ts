/** Static fallback when a user has no uploaded profile photo. */
export const DEFAULT_USER_AVATAR = "/default-avatar.svg";

export function userAvatarSrc(image?: string | null): string {
  const trimmed = image?.trim();
  return trimmed ? trimmed : DEFAULT_USER_AVATAR;
}
