# Kubernetes Cluster Setup (1 Master, 2 Workers)

This guide shows how to set up a Kubernetes cluster with:

- **1 Master node**
- **2 Worker nodes**
- **Network range (node IPs):** `192.168.61.0/24`
- **Pod CIDR block:** `10.100.0.0/16`

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
```
👉 Updates package lists and upgrades all installed software to the latest version.

```bash
sudo swapoff -a
```
👉 Disables swap memory (Kubernetes requires swap to be turned off).

```bash
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```
👉 Permanently disables swap after reboot by commenting out its entry in `/etc/fstab`.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```
👉 Creates a config file to ensure required kernel modules (`overlay`, `br_netfilter`) are loaded at boot.

```bash
sudo modprobe overlay
sudo modprobe br_netfilter
```
👉 Immediately loads the kernel modules without reboot.

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
```
👉 Configures networking to ensure Kubernetes networking functions properly.

```bash
sudo sysctl --system
```
👉 Applies all system-wide sysctl configurations.

---

## 📦 Step 2: Install Container Runtime (Containerd)

```bash
sudo apt install -y containerd
```
👉 Installs containerd (container runtime used by Kubernetes).

```bash
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```
👉 Creates a default configuration file for containerd.

Edit `/etc/containerd/config.toml` and ensure this line is set:
```toml
SystemdCgroup = true
```
👉 Ensures containerd uses systemd for cgroup management (recommended for Kubernetes).

```bash
sudo systemctl restart containerd
sudo systemctl enable containerd
```
👉 Restarts containerd and enables it to start automatically on boot.

---

## 📥 Step 3: Install Kubernetes Components

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
```
👉 Installs tools needed for downloading Kubernetes packages over HTTPS.

```bash
sudo mkdir -p /etc/apt/keyrings
```
👉 Creates a directory for Kubernetes GPG keys.

```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key   | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```
👉 Downloads and saves the Kubernetes package signing key.

```bash
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```
👉 Adds the Kubernetes APT repository.

```bash
sudo apt-get update
```
👉 Updates the package list with Kubernetes repo.

```bash
sudo apt-get install -y kubelet kubeadm kubectl
```
👉 Installs Kubernetes components:
- `kubelet`: Node agent
- `kubeadm`: Cluster bootstrap tool
- `kubectl`: Command-line tool to manage cluster

```bash
sudo apt-mark hold kubelet kubeadm kubectl
```
👉 Prevents accidental updates of Kubernetes components.

```bash
sudo systemctl enable --now kubelet
```
👉 Enables and starts kubelet service.

---

## 🎯 Step 4: Initialize Master Node

Run this **only on the master node (192.168.61.29):**
```bash
sudo kubeadm init \\
  --apiserver-advertise-address=<master-node-ip> \\ ## example 192.168.61.29
  --pod-network-cidr=<pod-network-cidr> ## example 10.100.0.0/16
```
👉 Initializes the control plane with master node IP and Pod CIDR.

Configure kubectl for your user:
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
👉 Copies cluster admin config and sets permissions so `kubectl` can be used.

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
👉 Installs and verifies **Cilium** as the CNI plugin for pod networking.

---

## 🖥️ Step 6: Join Worker Nodes

On **master**, generate join command:
```bash
kubeadm token create --print-join-command
```
👉 Prints the worker join command.

Example output:
```bash
sudo kubeadm join 192.168.61.29:6443 --token <TOKEN>   --discovery-token-ca-cert-hash sha256:<HASH>
```

Run this command on **each worker node** (`192.168.61.30`, `192.168.61.31`).

---

## ✅ Step 7: Verify Cluster

```bash
kubectl get nodes -o wide
```
👉 Shows all nodes and their status.

```bash
kubectl get pods -A -o wide
```
👉 Lists all running pods across namespaces.

```bash
kubectl cluster-info
```
👉 Displays API server and DNS info.

If everything works, you’ll see **1 master + 2 workers** in Ready state 🎉

---

## 📌 Notes
- **Pod CIDR:** `10.100.0.0/16`
- **Node subnet:** `192.168.61.0/24`
- **CNI Plugin:** Cilium
