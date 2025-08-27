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

argocd repo add git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --name carrybee-staging \
  --ssh-private-key-path ~/.ssh/id_rsa \
  --insecure-ignore-host-key
  



kubectl create ns staging

kubectl create secret docker-registry carrybee-secret \
  --docker-server=carrybee.harbor.com \
  --docker-username=shamim.ahmed \
  --docker-password=Sh#amim@47@83 \
  --docker-email=shamim.ahmed@technonext.com \
  --namespace=staging


kubectl get secret -n staging
NAME            TYPE                             DATA   AGE
harbor-secret   kubernetes.io/dockerconfigjson   1      8s

########################################################
kubectl create secret docker-registry carrybee-secret \
  --docker-server=491203818637.dkr.ecr.ap-southeast-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password="$(aws ecr get-login-password --region ap-southeast-1)" \
  --namespace=prod
########################################################


PART-01: ARGOCD
========================
========================
argocd app list
argocd app set argocd/ft-supplier-novoair --sync-policy none


ssh-keygen -t rsa -b 4096 -C "shamim.ahmed@technonext.com"
argocd repo add git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git --insecure-ignore-host-key --ssh-private-key-path ~/.ssh/id_rsa

Go Project
===============

argocd app create carrybee-oms \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path oms-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
# argocd app get carrybee-oms
# argocd app delete carrybee-oms --yes 
# kubectl patch app -n argocd carrybee-ingress -p '{"metadata":{"finalizers":null}}' --type merge

kubectl get po -n staging | egrep oms
NAME                                       READY   STATUS             RESTARTS         AGE
carrybee-oms-deployment-578f955d5d-7vtcg   1/1     Running            0                87m

kubectl exec -ti -n staging carrybee-oms-deployment-578f955d5d-7vtcg -- /bin/bash

tail -f /var/log/oms/envoy.log 
tail -f /var/log/oms/oms.log 
tail -f /var/log/oms/oms-worker.log

http://10.51.0.46:30100/v1/oms/health




argocd app create carrybee-pegasus \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path pegasus-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
# argocd app get carrybee-pegasus
# argocd app delete carrybee-pegasus --yes 


kubectl get po -n staging | egrep pegasus
carrybee-pegasus-deployment-645d6795cc-hswp7    1/1     Running   0          5m40s

kubectl exec -ti -n staging carrybee-pegasus-deployment-645d6795cc-hswp7 -- /bin/bash

tail -f /var/log/pegasus/envoy.log 
tail -f /var/log/pegasus/pegasus.log	


exit

http://10.47.2.103:30101/v1/ops/health
  




argocd app create carrybee-heimdall \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path heimdall-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
# argocd app get carrybee-heimdall
# argocd app delete carrybee-heimdall --yes 


kubectl get po -n staging | egrep heimdall
carrybee-heimdall-deployment-6fd5c4d798-cm6rm   1/1     Running   0          118s

kubectl exec -ti -n staging carrybee-heimdall-deployment-6fd5c4d798-cm6rm -- /bin/bash

tail -f /var/log/heimdall/envoy.log 
tail -f /var/log/heimdall/heimdall.log	


exit

http://10.47.2.103:30102/v1/auth/health




argocd app create carrybee-mohajon \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path mohajon \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
  
# argocd app get carrybee-mohajon
# argocd app delete carrybee-mohajon --yes 






argocd app create carrybee-kong \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path kong-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
  
# argocd app get carrybee-kong
# argocd app delete carrybee-kong --yes 








Next Js Project
===============
aladdin
hive


argocd app create carrybee-hive \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path hive-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
# argocd app get carrybee-hive
# argocd app delete carrybee-hive --yes 

http://10.47.2.103:30300/dashboard

argocd app create carrybee-aladdin \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path aladdin-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
# argocd app get carrybee-aladdin
# argocd app delete carrybee-aladdin --yes 

http://10.47.2.103:30301/dashboard





argocd app create carrybee-ingress \
  --repo git@vcs.technonext.com:TechnoNext/DevOps/carrybee-manifests.git \
  --path ingress-k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging \
  --revision deployment-staging \
  --sync-policy auto
  
# argocd app get carrybee-ingress
# argocd app delete carrybee-ingress --yes 
























