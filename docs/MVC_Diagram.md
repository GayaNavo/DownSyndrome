# MVC Architecture Diagram

```mermaid
graph TD
    A[View/Pages] --> B[Controller]
    B --> C[Service]
    C --> D[Model]
    D --> C
    C --> B
    B --> A
    
    style A fill:#ffe4c4,stroke:#333
    style B fill:#dda0dd,stroke:#333
    style C fill:#98fb98,stroke:#333
    style D fill:#87ceeb,stroke:#333
    
    A[View<br/>Next.js Pages]:::view
    B[Controller<br/>Business Logic Interface]:::controller
    C[Service<br/>Business Logic]:::service
    D[Model<br/>Data Structure]:::model
    
    classDef view fill:#ffe4c4,stroke:#333;
    classDef controller fill:#dda0dd,stroke:#333;
    classDef service fill:#98fb98,stroke:#333;
    classDef model fill:#87ceeb,stroke:#333;
```

## Component Responsibilities

### View (Next.js Pages)
- Render UI components
- Handle user interactions
- Communicate with controllers

### Controller
- Receive requests from views
- Validate input data
- Coordinate with services
- Return responses to views

### Service
- Implement business logic
- Handle data operations
- Manage data validation
- Provide clean APIs for controllers

### Model
- Define data structures
- Contain data validation logic
- Represent business entities