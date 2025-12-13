class ServerInfoService:
    def get_ports(self, server_id):
        # Mock ports
        return [
            {"port": 80, "protocol": "tcp", "process": "nginx", "pid": 101},
            {"port": 22, "protocol": "tcp", "process": "sshd", "pid": 102},
            {"port": 8000, "protocol": "tcp", "process": "python", "pid": 103},
        ]

    def get_docker_containers(self, server_id):
        # Mock docker
        return [
            {"name": "the-gauntlet-backend", "image": "backend:latest", "status": "Up 2 hours", "ports": "8000:8000"},
            {"name": "postgres-db", "image": "postgres:15", "status": "Up 2 days", "ports": "5432:5432"},
        ]

server_info_service = ServerInfoService()
