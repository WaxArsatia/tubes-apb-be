import { badRequest, unsupportedMediaType } from "@/common/errors/app-error";
import { saveProfilePicture } from "@/common/upload/upload";
import { settingsRepository } from "@/modules/settings/settings.repository";

const getSingleFormValue = (
  value: FormDataEntryValue | FormDataEntryValue[] | undefined,
) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const settingsService = {
  async updateProfile(userId: string, rawBody: Record<string, unknown>) {
    const firstNameValue = getSingleFormValue(
      rawBody.firstName as
        | FormDataEntryValue
        | FormDataEntryValue[]
        | undefined,
    );
    const lastNameValue = getSingleFormValue(
      rawBody.lastName as FormDataEntryValue | FormDataEntryValue[] | undefined,
    );
    const profilePictureValue = getSingleFormValue(
      rawBody.profilePicture as
        | FormDataEntryValue
        | FormDataEntryValue[]
        | undefined,
    );

    const firstName =
      typeof firstNameValue === "string" ? firstNameValue.trim() : undefined;
    const lastName =
      typeof lastNameValue === "string" ? lastNameValue.trim() : undefined;

    if (firstName === "" || lastName === "") {
      throw badRequest("Validation failed", {
        ...(firstName === ""
          ? { firstName: ["firstName cannot be empty"] }
          : {}),
        ...(lastName === "" ? { lastName: ["lastName cannot be empty"] } : {}),
      });
    }

    let profilePictureUrl: string | undefined;

    if (profilePictureValue !== undefined) {
      if (!(profilePictureValue instanceof File)) {
        throw unsupportedMediaType("profilePicture must be a file upload");
      }

      profilePictureUrl = await saveProfilePicture(profilePictureValue);
    }

    if (!firstName && !lastName && !profilePictureUrl) {
      throw badRequest("No profile field provided");
    }

    const updatedUser = await settingsRepository.updateProfile({
      userId,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
    });

    if (!updatedUser) {
      throw badRequest("Failed to update profile");
    }

    return {
      updated: true as const,
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  },
};
