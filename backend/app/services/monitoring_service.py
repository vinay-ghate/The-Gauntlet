import psutil
import logging
from typing import List, Dict, Any
from collections import defaultdict

logger = logging.getLogger(__name__)

class MonitoringService:
    """Advanced monitoring service for processes and network"""
    
    def get_detailed_processes(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get detailed process information"""
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
        """Get active network connections"""
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
        """Get network I/O statistics"""
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
        """Get CPU usage per core"""
        try:
            # Use interval=None for non-blocking call (returns usage since last call)
            return psutil.cpu_percent(interval=None, percpu=True)
        except Exception as e:
            logger.error(f"Error getting CPU per core: {e}")
            return []
    
    def get_port_usage(self) -> Dict[str, int]:
        """Get port usage statistics"""
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
        """Get comprehensive monitoring snapshot"""
        return {
            "processes": self.get_detailed_processes(),
            "network_connections": self.get_network_connections(),
            "network_stats": self.get_network_stats(),
            "cpu_per_core": self.get_cpu_per_core(),
            "port_usage": self.get_port_usage()
        }
    
    def terminate_process(self, pid: int) -> bool:
        """Terminate a process gracefully"""
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
        """Kill a process forcefully"""
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
        """Suspend a process"""
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
        """Resume a suspended process"""
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
