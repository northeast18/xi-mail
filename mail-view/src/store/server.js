import { defineStore } from 'pinia'

const isStandalone = import.meta.env.VITE_STANDALONE === 'true'
const builtinBaseURL = import.meta.env.VITE_BASE_URL

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useServerStore = defineStore('server', {
  state: () => ({
    servers: [],
    activeServerId: null,
  }),

  getters: {
    activeServer(state) {
      return state.servers.find(s => s.id === state.activeServerId) || state.servers[0] || null
    },
    connectedServers(state) {
      return state.servers.filter(s => s.token)
    },
    needSetup(state) {
      return isStandalone && state.servers.length === 0
    },
    isStandalone: () => isStandalone,
  },

  actions: {
    init() {
      if (!isStandalone && this.servers.length === 0) {
        this.servers.push({
          id: 'local',
          name: 'Local',
          url: builtinBaseURL || '/api',
          token: localStorage.getItem('token') || '',
          connected: false,
        })
        this.activeServerId = 'local'
      }
      if (this.servers.length > 0 && !this.activeServerId) {
        this.activeServerId = this.servers[0].id
      }
    },

    addServer(name, url) {
      const normalized = url.replace(/\/+$/, '')
      const id = generateId()
      this.servers.push({ id, name, url: normalized, token: '', connected: false })
      if (!this.activeServerId) this.activeServerId = id
      return id
    },

    removeServer(id) {
      const idx = this.servers.findIndex(s => s.id === id)
      if (idx === -1) return
      this.servers.splice(idx, 1)
      if (this.activeServerId === id) {
        this.activeServerId = this.servers[0]?.id || null
      }
    },

    updateServer(id, patch) {
      const server = this.servers.find(s => s.id === id)
      if (server) Object.assign(server, patch)
    },

    setActiveServer(id) {
      if (this.servers.find(s => s.id === id)) {
        this.activeServerId = id
      }
    },

    setToken(id, token) {
      const server = this.servers.find(s => s.id === id)
      if (server) {
        server.token = token
        server.connected = !!token
      }
      if (!isStandalone && id === 'local') {
        localStorage.setItem('token', token)
      }
    },

    getToken(id) {
      const server = this.servers.find(s => s.id === (id || this.activeServerId))
      return server?.token || ''
    },

    clearToken(id) {
      this.setToken(id, '')
    },

    getActiveBaseURL() {
      return this.activeServer?.url || builtinBaseURL || '/api'
    },
  },

  persist: {
    key: 'xi-servers',
    pick: ['servers', 'activeServerId'],
  },
})
