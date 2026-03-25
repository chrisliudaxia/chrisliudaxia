# Migrate DramaQuickCut to a dedicated repository

This repository is currently serving two purposes:

1. GitHub profile README repository
2. Temporary landing place for the DramaQuickCut codebase

## Recommended next step

Create a dedicated repository such as:

- `chrisliudaxia/dramaquickcut`
- `chrisliudaxia/drama-quick-cut`

After the new repository exists and is authorized in ChatGPT, the code can be moved there and this profile repository can be reduced back to just the profile README.

## Suggested migration flow

1. Create the new GitHub repository
2. Grant ChatGPT connector access to that repository
3. Return here and ask ChatGPT to push the DramaQuickCut code into the new repository
4. Keep only the profile README in `chrisliudaxia/chrisliudaxia`

## What should stay in this profile repo

- `README.md`
- Optional profile-only assets

## What should move to the dedicated project repo

- application source code
- docs
- environment templates
- build configuration
- project-specific assets
