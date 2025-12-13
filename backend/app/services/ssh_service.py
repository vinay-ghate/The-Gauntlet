import paramiko
import logging

logger = logging.getLogger(__name__)

class SSHService:
    def execute_command(self, host, user, key_path, command):
        # Implementation for Paramiko
        logger.info(f"Executing {command} on {host}")
        return "Mock Output", "", 0

ssh_service = SSHService()
