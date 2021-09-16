---
title: 树莓派搭建流计算集群
tags: [Flink, Redis, 树莓派, Streaming, Docker]
categories: Computing
date: 2021-09-04
---

# 树莓派搭建流计算集群

> 生活扇了我一巴掌，我能怎么办？擦擦脸，接着与生活同行。:-1
> 
> 无名 2021

本篇介绍如何利用（闲置的）树莓派搭设流处理集群。

原材料：树莓派若干。（我有两个ARMv7的树莓派4）

主要用到的技术和软件：
- Docker, 用来管理集群计算资源
- Portainer，集群管理UI
- Flink，原生流处理凭条
- Redis，缓存+Broker
- Prometheus，流监控
- Grafana，图形化流监控

集群控制没有使用K8s，因为k8s对32位处理器支持一般，而且没有原生的ARM支持，只能用一个API协调的软件叫k3s，后来发现还不如直接用`Docker Swarm`就行集群资源管理。反正所有的服务都是 docker 容器，后期集群扩容，只需要在新节点上加入集群即可。

最终我的集群包含两个Docker Swarm节点：

![](https://i.imgur.com/qphWSv6.png)

集群运行服务：

![](https://i.imgur.com/evOfMHt.png)

## 树莓派设置

首先，安装操作系统，具体可以[参考](https://www.raspberrypi.org/documentation/computers/getting-started.html)。基本的操作就是下载操作系统，烧录在sd卡里，然后把卡查回树莓派。
这里注意SD卡烧制系统结束后，在SD卡跟目录里加入一个空的叫`ssh`的文件，这样树莓派会自动激活ssh服务。默认用户是`pi`，密码是`raspberry`。这样就可以实现headless部署。

将多个树莓派通过集线器或者路由器连接起来，然后设置每个树莓派的hostname和静态IP地址。

静态IP地址可以在这里设置：`/etc/dhcpcd.conf`

```
interface eth0
static ip_address = 192.168.1.xxx
static domain_name_server = 192.168.1.1, 8.8.8.8
```

## 创建Docker Swarm集群

SSH进入一个树莓派，将它作为集群的主机：

1. 安装 Docker

```
curl -fsSL https://get.docker.com | sh
```

2. 创建 Swarm 集群

```
docker swarm init --advertise-adr 192.168.1.xxx
```

其中`xxx`就是当前选定的集群主机静态IP地址。这个命令会生成一个token，记录token用来后续接入其他集群节点。

在其他节点树莓派中同样安装docker，但是输入如下命令连接入集群：

```
docker swarm join --token 这里是你的token 192.168.1.xxx:2377
```

所有节点接入集群后，可以在集群主机查看集群状态：`docker node ls`。

```
$ docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
4588i2fvipv17led4hptn349s *   pi1        Ready     Active         Leader           20.10.8
uvhsalsyo9zfx8z5ny4nfb4ze     pi2        Ready     Active                          20.10.8
```

3. 安装 Portainer 监控集群状态

在主机执行：

```
$ docker volume create portainer_data
$ docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

然后就可用过访问`192.168.1.xxx:9000`访问集群控制界面了。

## 部署流处理集群服务

具体的配置文件见这个[repo](https://github.com/wangzhe3224/flink-fog-cluster)。

主要的工作在于自己build可用flink镜像，可以clone仓库，然后自己build一个镜像。也可以直接pull我做的好的镜像：`docker pull wangzhe3224/flink-1.13.2-armv7:latest`，这是针对的arml7处理器的，后期的树莓派应该都是v8版本了，需要另外重新构建。

下一步就是用docker文件配置各项服务：

```yaml=
version: "3"
services:
  jobmanager:
    image: digitaljazz/flink-1.8.0-armv7:latest
    ports:
      - "8081:8081"
    command: jobmanager.sh start-foreground jobmanager
    networks:
      flinknet:
        aliases:
          - jobmanager
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.hostname == worker04

  taskmanager:
    image: digitaljazz/flink-1.8.0-armv7:latest
    depends_on:
      - jobmanager
    command: taskmanager.sh start-foreground -Djobmanager.rpc.address=jobmanager
    networks:
      - flinknet
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.hostname != worker04
          - node.hostname != worker01

  mosquitto:
    image: eclipse-mosquitto:1.6.5
    ports:
      - "1883:1883"
      - "9001:9001"
    networks:
      flinknet:
        aliases:
          - mosquitto
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.hostname == worker01

  prometheus:
    image: prom/prometheus:latest
    networks:
      flinknet:
        aliases:
          - prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yaml:/etc/prometheus/prometheus.yml
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.hostname == worker04

  grafana:
    image: grafana/grafana:6.1.3
    depends_on:
      - prometheus
    networks:
      flinknet:
        aliases:
          - grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./grafana/provisioning/:/etc/grafana/provisioning/
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.hostname == worker04

networks:
  flinknet:
    driver: overlay
```

然后再集群主机：`docker stack deploy --compose-file docker-stack.yaml flink` 启动所有服务。

可以通过`docker service ls` 查看集群运行服务。