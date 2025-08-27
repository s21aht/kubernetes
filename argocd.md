# ArgoCD install in Kubernetes cluster

``
kubectl create namespace argocd

kubectl apply  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml -n argocd
# kubectl delete  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml -n argocd


kubectl edit svc -n argocd argocd-server  // type: NodePort // nodePort: 30200  // nodePort: 30201

kubectl get no -o wide

kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d  


curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd /usr/local/bin/argocd
# sudo rm /usr/local/bin/argocd
argocd version                     // argocd: v2.12.6+4dab5bd



argocd login 10.47.2.103:30201
Proceed insecurely (y/n)? y 
username: admin
password:                     // logged in successfully