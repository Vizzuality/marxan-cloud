# Feature Tagging (Brief)

This document provides a brief overview of the feature tagging system in Marxan

## Aim

The main objective is to let the user tag features, be it when they upload them or at a later point in time. This can be
useful for the users, so that they may be able to identify/group features and do any required operations based on that.

## Requirements

Whenever an user uploads a feature, they must be able to add a tag (although it shouldn't be a requirement when creating
the feature). There will be one tag per feature. The user must also be able to change the tag of a feature at later
point when editing the feature. There's an exception to this: System wide features (features with no project) are
considered to be non-taggable, however features obtained by splitting from System wide features will become effectively
regular features that can be tagged.

Each Project will have its own isolated set of tags; for example, tag `leprechaun` on Project A would be completely
independent from the same tag on project B. Related to his, all operations related to tags (such as renaming, removing),
will be applied on a given project, and its related tags; when removing tag `leprechaun` from project A, the same tag
from project B will remain unaffected. Tags can only be modified in the inventory panel.

Tags should be restricted to a maximum number of characters (this amount can be configurable), and should not contain
special characters such as new lines. Misspellings and variations of the tag should be handled by the users themselves.
However, even though no capitalization scheme is enforced (the user can use tag in whichever capitalization they want),
**capitalization uniqueness is**; so if there's a tag `Cat`, tagging a feature with `cat` or `CAT`, the system will
internally tag with the already existent capitalization of `Cat`.
Bulk operations are not required to be implemented on the API side.

## Use cases

This are the main use cases that are to be expected:

- tagging a feature (when uploading, or as an isolated operation)
- update/change a tag in a feature
- remove the tag of a feature
- get all features for a given project and tag
- remove a tag in a project (thus removing the tags from the affected features)
- renaming a tag in a project
- query tags for a project with partial match on the tag name (by default, tags containing `lepr`, other matching styles
  can be considered in the implementation)
