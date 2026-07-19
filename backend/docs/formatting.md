# Code Formatting (Spotless)

Consistent code formatting is crucial for maintaining readability and minimizing Git merge conflicts across multiple teams. The Arcade Backend uses **Spotless** alongside the **Google Java Format** standard.

## The Workflow

Spotless is configured as a Maven plugin. It enforces formatting strictly. If your code is not formatted correctly, the CI/CD pipeline will fail the build. 

You should make formatting a regular part of your local development workflow before pushing commits.

### Applying Formatting
To automatically fix all formatting issues in your codebase, run:

```bash
./mvnw spotless:apply
```
*Run this command frequently, ideally right before you commit your code.*

### Checking Formatting
To check if your code conforms to the standard without actually modifying the files (this is what the CI/CD pipeline runs), use:

```bash
./mvnw spotless:check
```

If the check fails, it will output a list of files that have formatting violations. Simply run `spotless:apply` to fix them.

## IDE Integration
You can optionally configure your IDE (IntelliJ, Eclipse) to use the Google Java Format plugin, allowing your IDE's auto-format shortcut to match the Spotless output perfectly.
