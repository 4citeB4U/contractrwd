/**
 * Local Storage Service
 * Handles saving contract data to IndexedDB for record keeping
 */

const StorageService = {
    dbName: 'ContractSigningApp',
    dbVersion: 1,
    storeName: 'contracts',
    
    // Initialize IndexedDB
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    
                    // Create indexes
                    objectStore.createIndex('email', 'email', { unique: false });
                    objectStore.createIndex('fullName', 'fullName', { unique: false });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },
    
    // Save contract data
    saveContract: function(contractData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            // Add timestamp and unique ID
            const dataToSave = {
                ...contractData,
                timestamp: new Date().toISOString(),
                dateCreated: new Date().toLocaleDateString(),
                status: 'completed'
            };
            
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            
            const request = objectStore.add(dataToSave);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('Failed to save contract'));
            };
        });
    },
    
    // Get all contracts
    getAllContracts: function() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('Failed to retrieve contracts'));
            };
        });
    },
    
    // Get contract by ID
    getContract: function(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('Failed to retrieve contract'));
            };
        });
    },
    
    // Get contracts by email
    getContractsByEmail: function(email) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const index = objectStore.index('email');
            const request = index.getAll(email);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('Failed to retrieve contracts by email'));
            };
        });
    },
    
    // Delete contract by ID
    deleteContract: function(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(new Error('Failed to delete contract'));
            };
        });
    },
    
    // Export all contracts as JSON
    exportContracts: function() {
        return this.getAllContracts().then(contracts => {
            const dataStr = JSON.stringify(contracts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `contracts_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return contracts;
        });
    },
    
    // Clear all contracts (use with caution)
    clearAllContracts: function() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(new Error('Failed to clear contracts'));
            };
        });
    },
    
    // Get storage statistics
    getStorageStats: function() {
        return this.getAllContracts().then(contracts => {
            return {
                totalContracts: contracts.length,
                oldestContract: contracts.length > 0 ? Math.min(...contracts.map(c => new Date(c.timestamp))) : null,
                newestContract: contracts.length > 0 ? Math.max(...contracts.map(c => new Date(c.timestamp))) : null,
                uniqueEmails: [...new Set(contracts.map(c => c.email))].length
            };
        });
    }
};

// Export the StorageService object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}