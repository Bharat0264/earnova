import { api } from './api'
export const analyticsSessionId = () => { let value = sessionStorage.getItem('earnova_analytics_session'); if (!value) { value = crypto.randomUUID(); sessionStorage.setItem('earnova_analytics_session', value) } return value }
export const track = (eventType, payload = {}) => api.post('/analytics/events', { eventType, sessionId: analyticsSessionId(), ...payload }).catch(() => {})
