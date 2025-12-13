import psutil
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class MetricsService:
    def get_snapshot(self, server_id: str):
        """Get comprehensive system metrics using psutil (cross-platform)"""
        try:
            # Basic metrics
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            disk = psutil.disk_usage('/')
            disk_usage = disk.percent
            
            # System uptime
            boot_time = datetime.fromtimestamp(psutil.boot_time())
            uptime = datetime.now() - boot_time
            uptime_str = f"{uptime.days}d {uptime.seconds//3600}h {(uptime.seconds//60)%60}m"
            
            # CPU info
            cpu_count = psutil.cpu_count(logical=False)  # Physical cores
            cpu_count_logical = psutil.cpu_count(logical=True)  # Logical cores
            
            # Memory info
            total_memory_gb = round(memory.total / (1024**3), 2)
            available_memory_gb = round(memory.available / (1024**3), 2)
            
            # Disk info
            total_disk_gb = round(disk.total / (1024**3), 2)
            free_disk_gb = round(disk.free / (1024**3), 2)
            
            # Network info
            net_io = psutil.net_io_counters()
            bytes_sent_mb = round(net_io.bytes_sent / (1024**2), 2)
            bytes_recv_mb = round(net_io.bytes_recv / (1024**2), 2)
            
            # Top 5 processes by CPU
            top_processes = []
            try:
                processes = []
                for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                    try:
                        pinfo = proc.info
                        if pinfo['cpu_percent'] is not None:
                            processes.append(pinfo)
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
                
                # Sort by CPU usage and get top 5
                processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)
                top_processes = [
                    {
                        "pid": p['pid'],
                        "name": p['name'],
                        "cpu": round(p['cpu_percent'] or 0, 1),
                        "memory": round(p['memory_percent'] or 0, 1)
                    }
                    for p in processes[:5]
                ]
            except Exception as e:
                logger.warning(f"Error getting process info: {e}")
            
            logger.info(f"Metrics for server {server_id}: CPU={cpu_usage}%, RAM={memory_usage}%, Disk={disk_usage}%")
            
            return {
                # Basic metrics
                "cpu_usage": round(cpu_usage, 1),
                "memory_usage": round(memory_usage, 1),
                "disk_usage": round(disk_usage, 1),
                
                # Detailed info
                "cpu_count": cpu_count,
                "cpu_count_logical": cpu_count_logical,
                "total_memory_gb": total_memory_gb,
                "available_memory_gb": available_memory_gb,
                "total_disk_gb": total_disk_gb,
                "free_disk_gb": free_disk_gb,
                "uptime": uptime_str,
                
                # Network
                "network_sent_mb": bytes_sent_mb,
                "network_recv_mb": bytes_recv_mb,
                
                # Top processes
                "top_processes": top_processes
            }
        except Exception as e:
            logger.error(f"Error getting metrics: {e}")
            # Return minimal fallback data
            return {
                "cpu_usage": 0.0,
                "memory_usage": 0.0,
                "disk_usage": 0.0,
                "cpu_count": 0,
                "cpu_count_logical": 0,
                "total_memory_gb": 0.0,
                "available_memory_gb": 0.0,
                "total_disk_gb": 0.0,
                "free_disk_gb": 0.0,
                "uptime": "N/A",
                "network_sent_mb": 0.0,
                "network_recv_mb": 0.0,
                "top_processes": []
            }

metrics_service = MetricsService()
