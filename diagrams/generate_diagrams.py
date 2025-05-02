import os
import re
import requests
import json
import base64

def extract_mermaid_code(markdown_file):
    """Extract Mermaid code from a markdown file."""
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use regex to find mermaid code blocks
    pattern = r'```mermaid\n(.*?)```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    if matches:
        return matches[0]
    else:
        return None

def generate_mermaid_image_with_api(mermaid_code, output_file):
    """Generate a PNG image from Mermaid code using the Mermaid.ink API."""
    # Base64 encode the Mermaid code
    encoded_code = base64.urlsafe_b64encode(mermaid_code.encode('utf-8')).decode('utf-8')
    
    # Use the Mermaid.ink service to render the diagram
    # This is a public service that renders Mermaid diagrams
    url = f"https://mermaid.ink/img/{encoded_code}"
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Save the image to file
        with open(output_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        print(f"Generated {output_file} using Mermaid.ink API")
        return True
        
    except Exception as e:
        print(f"Error generating image with Mermaid.ink API: {e}")
        # Fall back to using Kroki API if Mermaid.ink fails
        return generate_mermaid_image_with_kroki(mermaid_code, output_file)

def generate_mermaid_image_with_kroki(mermaid_code, output_file):
    """Generate a PNG image from Mermaid code using the Kroki API as a backup."""
    try:
        # Prepare the payload for the Kroki API
        payload = {
            "diagram_source": mermaid_code,
            "diagram_type": "mermaid",
            "output_format": "png",
            "theme": "default"
        }
        
        # Send a POST request to Kroki API
        response = requests.post("https://kroki.io/mermaid/png", json=payload)
        response.raise_for_status()
        
        # Save the image to file
        with open(output_file, 'wb') as f:
            f.write(response.content)
            
        print(f"Generated {output_file} using Kroki API")
        return True
        
    except Exception as e:
        print(f"Error generating image with Kroki API: {e}")
        # If both APIs fail, try using a local rendering method using Node.js
        return generate_mermaid_image_with_local_method(mermaid_code, output_file)

def generate_mermaid_image_with_local_method(mermaid_code, output_file):
    """
    A last resort method that creates an HTML file the user can open in a browser
    and save manually, if the API methods fail.
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Mermaid Diagram</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <script>
            mermaid.initialize({{
                startOnLoad: true,
                theme: 'default',
                flowchart: {{
                    htmlLabels: true,
                    useMaxWidth: false,
                }},
                themeVariables: {{
                    fontFamily: 'Arial',
                    fontSize: '16px'
                }}
            }});
        </script>
        <style>
            body {{
                background: white;
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
            }}
            #container {{
                width: 100%;
                display: flex;
                justify-content: center;
            }}
            h1 {{
                text-align: center;
            }}
            .instructions {{
                margin: 20px auto;
                max-width: 800px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
                border: 1px solid #ddd;
            }}
        </style>
    </head>
    <body>
        <h1>Mermaid Diagram</h1>
        <div class="instructions">
            <p>To save this diagram as an image:</p>
            <ol>
                <li>Right-click on the diagram below</li>
                <li>Select "Save image as..."</li>
                <li>Save it to the diagrams folder with the appropriate name</li>
            </ol>
        </div>
        <div id="container">
            <div class="mermaid">
{mermaid_code}
            </div>
        </div>
    </body>
    </html>
    """
    
    # Create an HTML file in the same directory as the output file
    html_file_path = output_file.replace('.png', '.html')
    with open(html_file_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"APIs failed. Created HTML file at {html_file_path}")
    print("Please open this file in a browser and save the diagram manually.")
    return False

def main():
    diagrams_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Process architecture diagram
    arch_md = os.path.join(diagrams_dir, "architecture_diagram.md")
    arch_code = extract_mermaid_code(arch_md)
    if arch_code:
        output_file = os.path.join(diagrams_dir, "architecture_diagram.png")
        generate_mermaid_image_with_api(arch_code, output_file)
    
    # Process component diagram (now using the renamed simplified version)
    comp_md = os.path.join(diagrams_dir, "component_diagram.md")
    comp_code = extract_mermaid_code(comp_md)
    if comp_code:
        output_file = os.path.join(diagrams_dir, "component_diagram.png")
        generate_mermaid_image_with_api(comp_code, output_file)

if __name__ == "__main__":
    main()