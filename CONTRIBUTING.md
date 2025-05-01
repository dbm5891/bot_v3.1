# Contributing to Bot v3.1

Thank you for your interest in contributing to the Bot v3.1 trading system. This guide will help you get started with contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Respect the project's design decisions
- Help others learn and grow

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. A clear, descriptive title
2. A detailed description of the issue
3. Steps to reproduce
4. Expected vs. actual behavior
5. Screenshots if applicable
6. Environment information (OS, Python version, etc.)

### Suggesting Enhancements

For feature requests:

1. Describe the enhancement clearly
2. Explain why this would be valuable
3. Outline how it could be implemented
4. Discuss potential alternatives
5. Include mockups or examples if possible

### Code Contributions

#### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/bot_v3.1.git
   ```
3. Install dependencies:
   ```bash
   cd bot_v3.1
   pip install -r requirements.txt
   ```

#### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test your changes:
   - Ensure existing tests pass
   - Add new tests for new features
   - Run data preparation and backtesting scripts to verify behavior

4. Follow the style guidelines:
   - Use descriptive variable names
   - Add comments for complex logic
   - Follow PEP 8 conventions
   - Maintain consistent docstring format

#### Submitting a Pull Request

1. Commit your changes with a clear message
2. Push to your fork
3. Submit a pull request with:
   - Clear title and description
   - Reference to any related issues
   - Explanation of what your changes do
   - Notes on any dependencies added

#### Pull Request Review Process

1. Maintainers will review your PR
2. Feedback may be given for improvements
3. Once approved, changes will be merged
4. Your contribution will be credited in the changelog

## Development Guidelines

### Strategy Contributions

When adding a new trading strategy:

1. Follow the naming convention: `st_strategy_name.py`
2. Include comprehensive docstrings explaining:
   - Strategy concept
   - Parameters
   - Expected behavior
3. Add proper initialization of tracking variables:
   ```python
   self.orders = []
   self.trades = []
   self.trades_info = []
   self.positions_info = []
   ```
4. Implement required notification methods:
   - `notify_order`
   - `notify_trade` 
5. Add your strategy to the strategy documentation

### Indicator Contributions

When adding a new indicator:

1. Follow the naming convention: `in_indicator_name.py`
2. Extend from `bt.Indicator` or appropriate base class
3. Include parameter descriptions and default values
4. Add plotting configuration if applicable
5. Test with multiple data scenarios
6. Document the indicator in the indicators README

### Documentation Contributions

When updating documentation:

1. Follow the existing structure and style
2. Ensure cross-references are maintained
3. Include practical examples
4. Update the main documentation index if needed

### Testing Guidelines

- Add tests for new features
- Ensure backwards compatibility
- Test across multiple data sets
- Verify performance impact

## Recognition

All contributors will be acknowledged in:

- The CHANGELOG.md file
- Release notes
- Project documentation

Thank you for contributing to Bot v3.1!