export interface IPrivacyService {
  updateBlockStatus(jid: string, action: 'block' | 'unblock'): Promise<void>;
  fetchBlocklist(): Promise<(string | undefined)[]>;
  fetchPrivacySettings(): Promise<Record<string, string>>;
  updateLastSeenPrivacy(value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'): Promise<void>;
  updateProfilePicturePrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void>;
  updateStatusPrivacy(value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'): Promise<void>;
  updateReadReceiptsPrivacy(value: 'all' | 'none'): Promise<void>;
  updateGroupsAddPrivacy(value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'): Promise<void>;
  updateOnlinePrivacy(value: 'all' | 'match_last_seen'): Promise<void>;
}
