from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from app.config import settings
import logging
import os
import subprocess
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

# Define file system tools
@tool
def list_files(directory: str = ".") -> str:
    """List all files and directories in the specified directory.
    
    Args:
        directory: The directory path to list (default is current directory)
    
    Returns:
        A formatted string listing all files and directories
    """
    try:
        path = Path(directory).resolve()
        if not path.exists():
            return f"Error: Directory '{directory}' does not exist"
        
        items = []
        for item in path.iterdir():
            item_type = "DIR" if item.is_dir() else "FILE"
            size = item.stat().st_size if item.is_file() else 0
            modified = datetime.fromtimestamp(item.stat().st_mtime).strftime('%Y-%m-%d %H:%M')
            items.append(f"{item_type:6} {size:>10} {modified} {item.name}")
        
        result = f"Contents of {directory}:\n"
        result += f"{'TYPE':6} {'SIZE':>10} {'MODIFIED':16} NAME\n"
        result += "-" * 60 + "\n"
        result += "\n".join(sorted(items))
        return result
    except Exception as e:
        return f"Error listing directory: {str(e)}"

@tool
def change_directory(directory: str) -> str:
    """Change to a different directory and show its contents.
    
    Args:
        directory: The directory path to change to
    
    Returns:
        Confirmation message and directory contents
    """
    try:
        path = Path(directory).resolve()
        if not path.exists():
            return f"Error: Directory '{directory}' does not exist"
        if not path.is_dir():
            return f"Error: '{directory}' is not a directory"
        
        # Change directory
        os.chdir(path)
        current = os.getcwd()
        
        # List contents
        contents = list_files(".")
        return f"Changed to: {current}\n\n{contents}"
    except Exception as e:
        return f"Error changing directory: {str(e)}"

@tool
def show_file_details(filepath: str) -> str:
    """Show detailed information about a specific file.
    
    Args:
        filepath: The path to the file
    
    Returns:
        Detailed file information including size, permissions, timestamps
    """
    try:
        path = Path(filepath).resolve()
        if not path.exists():
            return f"Error: File '{filepath}' does not exist"
        
        stat = path.stat()
        details = f"File Details for: {path}\n"
        details += "-" * 60 + "\n"
        details += f"Type: {'Directory' if path.is_dir() else 'File'}\n"
        details += f"Size: {stat.st_size:,} bytes\n"
        details += f"Created: {datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S')}\n"
        details += f"Modified: {datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')}\n"
        details += f"Accessed: {datetime.fromtimestamp(stat.st_atime).strftime('%Y-%m-%d %H:%M:%S')}\n"
        
        if path.is_file():
            # Try to detect file type
            suffix = path.suffix.lower()
            file_types = {
                '.py': 'Python Script',
                '.js': 'JavaScript',
                '.ts': 'TypeScript',
                '.json': 'JSON Data',
                '.md': 'Markdown',
                '.txt': 'Text File',
                '.csv': 'CSV Data',
            }
            details += f"File Type: {file_types.get(suffix, 'Unknown')}\n"
        
        return details
    except Exception as e:
        return f"Error getting file details: {str(e)}"

@tool
def get_current_directory() -> str:
    """Get the current working directory.
    
    Returns:
        The current working directory path
    """
    return f"Current directory: {os.getcwd()}"

@tool
def search_files(pattern: str, directory: str = ".") -> str:
    """Search for files matching a pattern in the directory.
    
    Args:
        pattern: The pattern to search for (e.g., '*.py', 'test*')
        directory: The directory to search in (default is current)
    
    Returns:
        List of matching files
    """
    try:
        path = Path(directory).resolve()
        if not path.exists():
            return f"Error: Directory '{directory}' does not exist"
        
        matches = list(path.glob(pattern))
        if not matches:
            return f"No files matching '{pattern}' found in {directory}"
        
        result = f"Files matching '{pattern}' in {directory}:\n"
        for match in sorted(matches):
            item_type = "DIR" if match.is_dir() else "FILE"
            result += f"{item_type:6} {match.name}\n"
        
        return result
    except Exception as e:
        return f"Error searching files: {str(e)}"

@tool
def execute_system_command(command: str) -> str:
    """Execute any system command.
    
    Args:
        command: The command to execute
    
    Returns:
        Command output
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout or result.stderr or "Command executed successfully"
    except subprocess.TimeoutExpired:
        return "Error: Command timed out"
    except Exception as e:
        return f"Error executing command: {str(e)}"

class AgentService:
    def __init__(self):
        self.llm = None
        self.tools = None
        self.setup_agent()

    def setup_agent(self):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set. Agent will not function correctly.")
            return

        try:
            # Initialize LLM with tool calling support
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash-lite",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.3
            )
            
            # Define all tools
            self.tools = [
                list_files,
                change_directory,
                show_file_details,
                get_current_directory,
                search_files,
                execute_system_command
            ]
            
            # Bind tools to LLM
            self.llm_with_tools = self.llm.bind_tools(self.tools)
            
            logger.info("Agent initialized successfully with file system tools")
        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}")

    async def chat(self, message: str, server_id: str):
        if not self.llm:
            return "Agent not initialized. Please ensure GEMINI_API_KEY is set in your .env file."
        
        try:
            # Create system message
            system_msg = """You are a helpful system operations assistant with access to file system tools.

You can help users:
- List files and directories
- Navigate the file system  
- Show detailed file information
- Search for files
- Execute safe system commands

Always be clear about what you're doing and provide helpful, formatted responses.
When showing file listings, maintain the formatting for readability.
If a user asks to do something unsafe, politely explain why you can't do it."""

            # Create messages
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": message}
            ]
            
            # Invoke LLM with tools
            response = await self.llm_with_tools.ainvoke(messages)
            
            # Check if tools were called
            if hasattr(response, 'tool_calls') and response.tool_calls:
                # Execute tool calls
                tool_results = []
                for tool_call in response.tool_calls:
                    tool_name = tool_call['name']
                    tool_args = tool_call['args']
                    
                    # Find and execute the tool
                    for tool_func in self.tools:
                        if tool_func.name == tool_name:
                            result = tool_func.invoke(tool_args)
                            tool_results.append(f"Tool '{tool_name}' result:\n{result}")
                            break
                
                # Return tool results
                if tool_results:
                    return "\n\n".join(tool_results)
            
            # Return direct response
            return response.content if hasattr(response, 'content') else str(response)
            
        except Exception as e:
            logger.error(f"Error during chat: {e}")
            return f"I encountered an error: {str(e)}"

agent_service = AgentService()
