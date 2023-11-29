# Friendbot



**Prerequisites:**

* The account instance must have been initialized with a 'network' argument.
* the network provided must not be the mainnet.



### **Features**

* **Initialize:** Useful for accounts that haven't been created in a test network yet, the initialize feature will automatically trigger the Friendbot for the provided network based on the `friendbotUrl` present in the network object. This will trigger the on-chain account creation and fund with it with lumens.
