import { useState } from 'react'
import { User, Phone, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

export default function ProfileForm() {
  const { user, updateUser } = useAuth()
  const [form,    setForm]    = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving,  setSaving]  = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSaved, setPwdSaved] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const data = await api.patch('/auth/profile', form)
      updateUser(data.user)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords don't match."); return
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters.'); return
    }
    setPwdSaving(true); setPwdError('')
    try {
      await api.patch('/auth/password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwdSaved(true); setTimeout(() => setPwdSaved(false), 2500)
    } catch (err) { setPwdError(err.message) }
    finally { setPwdSaving(false) }
  }

  const inp = (value, onChange, type = 'text', placeholder = '') => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
           className="input-base" />
  )

  return (
    <div className="space-y-6">

      {/* Profile info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5 lg:p-6">
        <h3 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" /> Personal Information
        </h3>

        {/* Avatar + referral code */}
        <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="font-display font-bold text-xl text-primary-700">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.referralCode && (
              <p className="text-xs text-primary-600 font-bold mt-0.5">
                Referral: {user.referralCode}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
            {inp(form.name, e => setForm(f => ({ ...f, name: e.target.value })), 'text', 'Your name')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
            {inp(form.phone, e => setForm(f => ({ ...f, phone: e.target.value })), 'tel', '9876543210')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
            <input type="email" value={user?.email || ''} disabled
                   className="input-base bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <button type="submit" disabled={saving}
                  className={`btn-primary py-2.5 text-sm flex items-center gap-2 ${saved ? '!bg-eco-600' : ''}`}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5 lg:p-6">
        <h3 className="font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" /> Change Password
        </h3>

        <form onSubmit={savePassword} className="space-y-4">
          {pwdError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {pwdError}
            </div>
          )}
          {['currentPassword', 'newPassword', 'confirmPassword'].map(k => (
            <div key={k}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {{ currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm New Password' }[k]}
              </label>
              <input type="password" value={pwdForm[k]}
                     onChange={e => setPwdForm(f => ({ ...f, [k]: e.target.value }))}
                     className="input-base" placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={pwdSaving}
                  className={`btn-primary py-2.5 text-sm flex items-center gap-2 ${pwdSaved ? '!bg-eco-600' : ''}`}>
            {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {pwdSaved ? <><CheckCircle2 className="w-4 h-4" /> Updated!</> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Wallet */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-5 text-white">
        <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-1">
          Referral Wallet
        </p>
        <p className="font-display font-bold text-3xl">
          ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
        </p>
        <p className="text-primary-300 text-xs mt-1">
          Lifetime earned: ₹{(user?.referralEarnings || 0).toLocaleString('en-IN')} · {user?.referralCount || 0} referrals
        </p>
      </div>
    </div>
  )
}
