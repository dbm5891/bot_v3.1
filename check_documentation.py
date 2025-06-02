#!/usr/bin/env python3
"""
Documentation checker for Bot v3.1
"""

import ast
import os
from pathlib import Path

def check_docstrings(filepath):
    """Check for missing docstrings in Python file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            tree = ast.parse(f.read())
    except (SyntaxError, UnicodeDecodeError):
        return []
    
    missing_docs = []
    
    class DocstringChecker(ast.NodeVisitor):
        def visit_FunctionDef(self, node):
            if not ast.get_docstring(node):
                missing_docs.append(f"Function '{node.name}' at line {node.lineno}")
            self.generic_visit(node)
        
        def visit_ClassDef(self, node):
            if not ast.get_docstring(node):
                missing_docs.append(f"Class '{node.name}' at line {node.lineno}")
            self.generic_visit(node)
        
        def visit_Module(self, node):
            if not ast.get_docstring(node):
                missing_docs.append("Module docstring missing")
            self.generic_visit(node)
    
    checker = DocstringChecker()
    checker.visit(tree)
    return missing_docs

def check_readme_files():
    """Check for missing README files in directories"""
    missing_readmes = []
    
    # Check main directories that should have README files
    important_dirs = [
        'backtesting',
        'backtesting/backtrader',
        'backtesting/backtrader/strategies',
        'backtesting/backtrader/indicators',
        'ta',
        'functional',
        'scripts',
        'scripts/testing',
        'diagrams'
    ]
    
    for dir_path in important_dirs:
        if os.path.exists(dir_path):
            readme_path = Path(dir_path) / 'README.md'
            if not readme_path.exists():
                missing_readmes.append(dir_path)
    
    return missing_readmes

def main():
    """Main function to check documentation"""
    print("Bot v3.1 Documentation Analysis")
    print("=" * 40)
    
    # Check for missing docstrings
    print("\n1. Checking for missing docstrings...")
    total_missing = 0
    
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git', 'venv', 'venv310']]
        
        for file in files:
            if file.endswith('.py'):
                filepath = Path(root) / file
                missing = check_docstrings(filepath)
                if missing:
                    print(f"\n{filepath}:")
                    for item in missing:
                        print(f"  - {item}")
                    total_missing += len(missing)
    
    if total_missing == 0:
        print("All functions and classes have docstrings!")
    else:
        print(f"\nTotal missing docstrings: {total_missing}")
    
    # Check for missing README files
    print("\n2. Checking for missing README files...")
    missing_readmes = check_readme_files()
    
    if missing_readmes:
        print("Missing README files in:")
        for dir_path in missing_readmes:
            print(f"  - {dir_path}")
    else:
        print("All important directories have README files!")
    
    # Generate documentation report
    with open('documentation_report.txt', 'w') as f:
        f.write("Bot v3.1 Documentation Report\n")
        f.write("=" * 40 + "\n\n")
        
        f.write(f"Missing docstrings: {total_missing}\n")
        f.write(f"Missing README files: {len(missing_readmes)}\n\n")
        
        if missing_readmes:
            f.write("Directories missing README files:\n")
            for dir_path in missing_readmes:
                f.write(f"  - {dir_path}\n")
    
    print(f"\nDocumentation report saved to documentation_report.txt")

if __name__ == "__main__":
    main()
