# Bot v3.1 Architecture Diagrams

This directory contains the architectural documentation for the Bot v3.1 system, presented as visual diagrams using Mermaid.js.

## Included Diagrams

### 1. Architecture Diagram (`architecture_diagram.md`, `architecture_diagram.png`)

The high-level architecture diagram provides an overview of the complete Bot v3.1 system, showing:

- Core components of the system
- Relationships between major modules
- External integrations (TradingView, TD Ameritrade)
- Data flows between components

### 2. Component Diagram (`component_diagram.md`, `component_diagram.png`) 

The component diagram offers a more detailed view of internal components and their relationships, focusing on:

- Specific implementations within each module
- Key connections between subcomponents
- Internal data flow
- Dependencies between different parts of the system

## Using the Diagrams

These diagrams serve several purposes:

- **Documentation**: Understanding the overall system architecture
- **Onboarding**: Helping new contributors grasp the system structure
- **Planning**: Evaluating areas for enhancement or modification
- **Communication**: Facilitating discussions about system design

## Updating the Diagrams

The diagrams are created using Mermaid.js, a JavaScript-based diagramming and charting tool that renders Markdown-inspired text definitions to create diagrams.

### Modifying a Diagram

1. Edit the `.md` file containing the Mermaid syntax
2. Use the provided `generate_diagrams.py` script to regenerate the PNG files:

```bash
cd c:\Users\dbm58\bot_v3.1\diagrams
python generate_diagrams.py
```

### Diagram Generation Script

The `generate_diagrams.py` script:

- Extracts Mermaid code from markdown files
- Attempts to render diagrams using online APIs (Mermaid.ink and Kroki.io)
- Falls back to generating HTML files for manual rendering when APIs fail
- Saves the resulting PNG files

## Requirements

To generate the diagrams, you need:

- Python 3.x
- The `requests` library (`pip install requests`)
- Internet connection (for API access)

## Additional Resources

- [Mermaid.js Documentation](https://mermaid-js.github.io/mermaid/)
- [Backtrader Documentation](backtesting/README.md)
- [Main Project Documentation](../DOCUMENTATION.md)