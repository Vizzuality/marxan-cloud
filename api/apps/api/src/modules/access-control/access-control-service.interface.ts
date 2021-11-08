interface IAccessControlService {
  /**
   * Checks if the given user can has the "Owner" role for the provided resource id.
   * This method should return "true" if one of the following conditions apply:
   *   - the user is a platform admin;
   *   - the user has a role greater or equal to "Owner" for the resource being checked;
   *   - the user has a role greater or equal to "Owner" for a resource hierarchically
   *   superior to the one being checked.
   *
   * @param resourceId The id of the resource being checked.
   * @param userId The id of the user.
   *
   * @returns {boolean} True/false if the provided user is owner of the provided resource.
   */
  isOwner(resourceId: string, userId: string): boolean;

  /**
   * Checks if the given user can has the "Contributor" role for the provided resource id.
   * This method should return "true" if one of the following conditions apply:
   *   - the user is a platform admin;
   *   - the user has a role greater or equal to "Contributor" for the resource being checked;
   *   - the user has a role greater or equal to "Contributor" for a resource hierarchically
   *   superior to the one being checked.
   *
   * @param resourceId The id of the resource being checked.
   * @param userId The id of the user.
   *
   * @returns {boolean} True/false if the provided user is contributor of the provided resource.
   */
  isContributor(resourceId: string, userId: string): boolean;

  /**
   * Checks if the given user can has the "Viewer" role for the provided resource id.
   * This method should return "true" if one of the following conditions apply:
   *   - the user is a platform admin;
   *   - the user has a role greater or equal to "Viewer" for the resource being checked;
   *   - the user has a role greater or equal to "Viewer" for a resource hierarchically
   *   superior to the one being checked.
   *
   * @param resourceId The id of the resource being checked.
   * @param userId The id of the user.
   *
   * @returns {boolean} True/false if the provided user is viewer of the provided resource.
   */
  isViewer(resourceId: string, userId: string): boolean;
}
