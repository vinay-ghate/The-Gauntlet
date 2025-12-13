import psutil
import logging
from typing import List, Dict, Any
from collections import defaultdict

logger = logging.getLogger(__name__)

class MonitoringService:
    """Advanced monitoring service for processes and network"""
    
    def get_detailed_processes(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve detailed information for running processes, returning the top CPU-consuming entries.
        
        Each item is a dictionary containing:
        - `pid`: process id (int)
        - `name`: process name (str), "Unknown" if unavailable
        - `cpu`: CPU usage percentage rounded to two decimals (float)
        - `memory`: memory usage percentage rounded to two decimals (float)
        - `status`: process status string
        - `username`: owning user (str), "N/A" if unavailable
        
        Parameters:
            limit (int): Maximum number of processes to return; results are sorted by `cpu` descending.
        
        Returns:
            List[Dict[str, Any]]: A list of process info dictionaries up to `limit` entries; returns an empty list on error.
        """
        try:
            processes = []
            # First call to initialize CPU percent tracking
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'username']):
                try:
                    pinfo = proc.info
                    # Use the cpu_percent from the iterator (non-blocking)
                    # Note: First call returns 0.0, subsequent calls return actual usage
                    cpu_percent = pinfo.get('cpu_percent', 0.0) or 0.0
                    
                    processes.append({
                        "pid": pinfo['pid'],
                        "name": pinfo['name'] or 'Unknown',
                        "cpu": round(cpu_percent, 2),
                        "memory": round(pinfo.get('memory_percent', 0.0) or 0.0, 2),
                        "status": pinfo.get('status', 'unknown'),
                        "username": pinfo.get('username') or 'N/A'
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
            
            # Sort by CPU usage
            processes.sort(key=lambda x: x['cpu'], reverse=True)
            return processes[:limit]
        except Exception as e:
            logger.error(f"Error getting processes: {e}", exc_info=True)
            return []
    
    def get_network_connections(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve active INET network connections.
        
        Parameters:
            limit (int): Maximum number of connection entries to return.
        
        Returns:
            connections (List[Dict[str, Any]]): A list of connection records (up to `limit`), each containing:
                - "local_address": local IP and port as "ip:port" or "N/A"
                - "remote_address": remote IP and port as "ip:port" or "N/A"
                - "status": connection status string
                - "pid": owning process id (0 if unavailable)
        """
        try:
            connections = []
            for conn in psutil.net_connections(kind='inet'):
                try:
                    local_addr = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A"
                    remote_addr = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A"
                    
                    connections.append({
                        "local_address": local_addr,
                        "remote_address": remote_addr,
                        "status": conn.status,
                        "pid": conn.pid or 0
                    })
                except Exception:
                    pass
            
            return connections[:limit]
        except Exception as e:
            logger.error(f"Error getting network connections: {e}")
            return []
    
    def get_network_stats(self) -> Dict[str, Any]:
        """
        Retrieve aggregate network I/O counters for the system.
        
        Returns:
            stats (dict): Mapping with keys:
                - bytes_sent: Total bytes sent.
                - bytes_recv: Total bytes received.
                - packets_sent: Total packets sent.
                - packets_recv: Total packets received.
                - errin: Number of inbound errors.
                - errout: Number of outbound errors.
        """
        try:
            net_io = psutil.net_io_counters()
            return {
                "bytes_sent": net_io.bytes_sent,
                "bytes_recv": net_io.bytes_recv,
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv,
                "errin": net_io.errin,
                "errout": net_io.errout
            }
        except Exception as e:
            logger.error(f"Error getting network stats: {e}")
            return {
                "bytes_sent": 0,
                "bytes_recv": 0,
                "packets_sent": 0,
                "packets_recv": 0,
                "errin": 0,
                "errout": 0
            }
    
    def get_cpu_per_core(self) -> List[float]:
        """
        Return per-core CPU utilization percentages.
        
        Returns:
            List[float]: A list where each element is the CPU usage percentage for a single logical core (0.0–100.0). Returns an empty list if the value cannot be retrieved.
        """
        try:
            # Use interval=None for non-blocking call (returns usage since last call)
            return psutil.cpu_percent(interval=None, percpu=True)
        except Exception as e:
            logger.error(f"Error getting CPU per core: {e}")
            return []
    
    def get_port_usage(self) -> Dict[str, int]:
        """
        Count active network connections by local port.
        
        Returns:
            port_usage (Dict[str, int]): Mapping where keys are local port numbers as strings and values are the number of active connections using that port.
        """
        try:
            port_counts = defaultdict(int)
            for conn in psutil.net_connections(kind='inet'):
                try:
                    if conn.laddr:
                        port_counts[str(conn.laddr.port)] += 1
                except Exception:
                    pass
            return dict(port_counts)
        except Exception as e:
            logger.error(f"Error getting port usage: {e}")
            return {}
    
    def get_monitoring_snapshot(self, server_id: str) -> Dict[str, Any]:
        """
        Produce a comprehensive monitoring snapshot for the given server.
        
        Parameters:
            server_id (str): Identifier of the server the snapshot represents.
        
        Returns:
            Dict[str, Any]: A dictionary with the following keys:
                - "processes": list of process info dictionaries (pid, name, cpu, memory, status, username).
                - "network_connections": list of active network connection dictionaries (local_address, remote_address, status, pid).
                - "network_stats": network I/O counters (bytes_sent, bytes_recv, packets_sent, packets_recv, errin, errout).
                - "cpu_per_core": list of per-core CPU usage percentages.
                - "port_usage": mapping of local port (str) to active connection count (int).
        """
        return {
            "processes": self.get_detailed_processes(),
            "network_connections": self.get_network_connections(),
            "network_stats": self.get_network_stats(),
            "cpu_per_core": self.get_cpu_per_core(),
            "port_usage": self.get_port_usage()
        }
    
    def terminate_process(self, pid: int) -> bool:
        """
        Attempt to terminate the process identified by the given PID.
        
        Parameters:
            pid (int): Process identifier of the target process.
        
        Returns:
            bool: `true` if the terminate request was issued successfully, `false` if the process does not exist, access is denied, or an error occurred.
        """
        try:
            proc = psutil.Process(pid)
            proc.terminate()
            logger.info(f"Process {pid} terminated successfully")
            return True
        except psutil.NoSuchProcess:
            logger.warning(f"Process {pid} does not exist")
            return False
        except psutil.AccessDenied:
            logger.error(f"Access denied to terminate process {pid}")
            return False
        except Exception as e:
            logger.error(f"Error terminating process {pid}: {e}")
            return False
    
    def kill_process(self, pid: int) -> bool:
        """
        Forcefully terminate the process identified by the given PID.
        
        Returns:
            `true` if the process was terminated, `false` if the process did not exist, access was denied, or an error occurred.
        """
        try:
            proc = psutil.Process(pid)
            proc.kill()
            logger.info(f"Process {pid} killed successfully")
            return True
        except psutil.NoSuchProcess:
            logger.warning(f"Process {pid} does not exist")
            return False
        except psutil.AccessDenied:
            logger.error(f"Access denied to kill process {pid}")
            return False
        except Exception as e:
            logger.error(f"Error killing process {pid}: {e}")
            return False
    
    def suspend_process(self, pid: int) -> bool:
        """
        Suspend the process with the given PID.
        
        Returns:
            True if the process was suspended, False otherwise.
        """
        try:
            proc = psutil.Process(pid)
            proc.suspend()
            logger.info(f"Process {pid} suspended successfully")
            return True
        except psutil.NoSuchProcess:
            logger.warning(f"Process {pid} does not exist")
            return False
        except psutil.AccessDenied:
            logger.error(f"Access denied to suspend process {pid}")
            return False
        except Exception as e:
            logger.error(f"Error suspending process {pid}: {e}")
            return False
    
    def resume_process(self, pid: int) -> bool:
        """
        Resume a suspended process.
        
        Returns:
            bool: True if the process was resumed successfully, False otherwise.
        """
        try:
            proc = psutil.Process(pid)
            proc.resume()
            logger.info(f"Process {pid} resumed successfully")
            return True
        except psutil.NoSuchProcess:
            logger.warning(f"Process {pid} does not exist")
            return False
        except psutil.AccessDenied:
            logger.error(f"Access denied to resume process {pid}")
            return False
        except Exception as e:
            logger.error(f"Error resuming process {pid}: {e}")
            return False

monitoring_service = MonitoringService()