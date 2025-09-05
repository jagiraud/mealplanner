# Technical Assumptions

* **Repository Structure:** Monorepo.
    * **Rationale:** A monorepo simplifies dependency management and enables code sharing between the frontend and backend, which is a key requirement for a full-stack application. It also allows for easier atomic commits and versioning across the entire project.
* **Service Architecture:** Microservices on Azure Functions.
    * **Rationale:** Building on Azure Functions provides a serverless architecture that is highly scalable and cost-effective. It allows us to break down the application into small, independent services (e.g., a service for recipe management, a service for user profiles, a service for shopping lists). This approach also aligns with our goal of "starting small and scaling fast".
* **Testing Requirements:** Full Testing Pyramid (Unit + Integration + E2E).
    * **Rationale:** A comprehensive testing strategy is essential for ensuring a high-quality, reliable, and maintainable product. We will start with a focus on unit and integration tests and add end-to-end (E2E) tests for critical user journeys as the project matures.
* **Additional Technical Assumptions and Requests:**
    * The front-end will be a modern JavaScript framework such as React, Vue, or Angular, with the final decision to be made during the architecture phase.
    * We will use a relational database, likely PostgreSQL, hosted on Azure.
    * We will use a standard authentication and authorization framework.
    * We will use a secure, scalable file storage solution for recipe images.
    * The infrastructure code must be written in Bicep, following the best practices outlined in the document: https://github.com/github/awesome-copilot/blob/main/instructions/bicep-code-best-practices.instructions.md.
    * The team must adhere to the instructions found at: https://github.com/github/awesome-copilot/blob/main/instructions/azure-functions-typescript.instructions.md.
