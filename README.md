# Kubernetes Cluster Setup (1 Master, 2 Workers)

This guide shows how to set up a Kubernetes cluster with:

- 1 Master node
- 2 Worker nodes
- Network range (node IPs): `192.168.61.0/24`
- Pod CIDR block: `10.100.0.0/16`

---

## 🏗️ System Architecture
```
                 +-------------------------+
                 |     Master Node         |
                 |  192.168.61.29          |
                 |-------------------------|
                 | - kube-apiserver        |
                 | - etcd                  |
                 | - controller-manager    |
                 | - scheduler             |
                 +-------------------------+
                           |
        --------------------------------------------
        |                                          |
+-------------------------+              +-------------------------+
|     Worker Node 1       |              |     Worker Node 2       |
|   192.168.61.30         |              |   192.168.61.31         |
|-------------------------|              |-------------------------|
| - kubelet               |              | - kubelet               |
| - containerd            |              | - containerd            |
| - Cilium Agent (CNI)    |              | - Cilium Agent (CNI)    |
+-------------------------+              +-------------------------+

       Pod Network (Cilium CNI) → 10.100.0.0/16
```

---

## 🚀 Step 1: Prepare All Nodes
```bash
sudo apt update && sudo apt upgrade -y
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

---

## 📦 Step 2: Install Container Runtime (Containerd)
```bash
sudo apt install -y containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```

Edit `/etc/containerd/config.toml` and ensure:
```toml
SystemdCgroup = true
```

```bash
sudo systemctl restart containerd
sudo systemctl enable containerd
```

---

## 📥 Step 3: Install Kubernetes Components
```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
sudo mkdir -p /etc/apt/keyrings

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key   | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
sudo systemctl enable --now kubelet
```

---

## 🎯 Step 4: Initialize Master Node
Run only on **master node (192.168.61.29):**
```bash
sudo kubeadm init   --apiserver-advertise-address=192.168.61.29   --pod-network-cidr=10.100.0.0/16
```

Set up kubeconfig:
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

---

## 🌐 Step 5: Install Cilium CNI
```bash
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64; if [ "$(uname -m)" = "aarch64" ]; then CLI_ARCH=arm64; fi

curl -L --fail --remote-name-all   https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}

sha256sum --check cilium-linux-${CLI_ARCH}.tar.gz.sha256sum
sudo tar xzvf cilium-linux-${CLI_ARCH}.tar.gz -C /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}

cilium install --version 1.17.0
cilium status --wait
```

---

## 🖥️ Step 6: Join Worker Nodes
On master, generate join command:
```bash
kubeadm token create --print-join-command
```

Example output:
```bash
sudo kubeadm join 192.168.61.29:6443 --token <TOKEN>   --discovery-token-ca-cert-hash sha256:<HASH>
```

Run this on each worker node (`192.168.61.30` and `192.168.61.31`).

---

## ✅ Step 7: Verify Cluster
```bash
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl cluster-info
```

If successful, you’ll see **1 master + 2 workers** in Ready state 🎉

---

## 📌 Notes
- Pod CIDR: `10.100.0.0/16`
- Node subnet: `192.168.61.0/24`
- CNI Plugin: **Cilium**
