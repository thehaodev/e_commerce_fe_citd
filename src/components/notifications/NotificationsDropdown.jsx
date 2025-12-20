import { useEffect, useMemo, useState } from "react";
import { FiBell, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useNotificationsStore from "../../store/notificationsStore";

const resolveEntityLink = (entityType, entityId, role) => {
  if (!entityType || !entityId) return null;
  const type = String(entityType).toUpperCase();
  const userRole = String(role || "").toUpperCase();

  switch (type) {
    case "OFFER":
      if (userRole === "SELLER") return `/seller/offers/${entityId}`;
      if (userRole === "BUYER") return `/buyer/offers/${entityId}`;
      if (userRole === "ADMIN") return `/admin/offers/${entityId}`;
      return null;
    case "SERVICE_REQUEST":
      if (userRole === "PROVIDER") return `/provider/service-requests/${entityId}`;
      if (userRole === "BUYER") return `/buyer/service-requests/${entityId}`;
      return null;
    case "PRIVATE_OFFER":
      if (userRole === "PROVIDER") return `/provider/private-offers/${entityId}`;
      return null;
    case "PROPOSAL":
      if (userRole === "PROVIDER") return `/provider/proposals/${entityId}`;
      if (userRole === "BUYER") return `/buyer/proposals/${entityId}`;
      return null;
    default:
      return null;
  }
};

const formatTimeAgo = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const NotificationRow = ({ item, onClick, variant }) => {
  const unread = !item?.is_read;
  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className={`flex w-full gap-3 px-4 py-3 text-left transition ${unread ? "bg-amber-50/60" : ""} ${variant.notificationHover}`}
    >
      <div
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${unread ? variant.notificationDot : "bg-slate-200"}`}
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{item?.title || "Notification"}</p>
        <p className="text-xs text-gray-600 line-clamp-2">{item?.message}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">
          {formatTimeAgo(item?.created_at)}
        </p>
      </div>
    </button>
  );
};

const NotificationsDropdown = ({ variant }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [open, setOpen] = useState(false);

  const {
    items: notificationItems,
    unreadCount,
    isLoading,
    loadList,
    markAsRead,
  } = useNotificationsStore();

  const displayUnread = useMemo(
    () => (unreadCount > 99 ? "99+" : unreadCount || 0),
    [unreadCount]
  );

  useEffect(() => {
    if (open) {
      loadList().catch(() => {});
    }
  }, [open, loadList]);

  const handleNotificationClick = async (item) => {
    if (!item?.id) return;
    const target = resolveEntityLink(item?.entity_type, item?.entity_id, role);
    await markAsRead([item.id]).catch(() => {});
    setOpen(false);
    if (target) {
      navigate(target);
    }
  };

  const variantClasses = {
    badgeClass: variant?.badgeClass || "bg-slate-500 text-white",
    panelBorder: variant?.panelBorder || "border-slate-200",
    panelDivider: variant?.panelDivider || "divide-slate-200",
    notificationDot: variant?.notificationDot || "bg-slate-500",
    notificationHover: variant?.notificationHover || "hover:bg-slate-50",
    iconButtonAccent: variant?.iconButtonAccent || "border-slate-200 hover:border-slate-300",
    actionText: variant?.actionText || "text-slate-600",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition ${variantClasses.iconButtonAccent}`}
      >
        <FiBell className="h-5 w-5" />
        <span
          className={`absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${variantClasses.badgeClass}`}
        >
          {displayUnread}
        </span>
      </button>
      {open && (
        <div
          className={`absolute right-0 mt-3 w-80 rounded-2xl border bg-white shadow-xl ${variantClasses.panelBorder}`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <button
              type="button"
              onClick={() => loadList().catch(() => {})}
              className={`text-xs font-semibold ${variantClasses.actionText}`}
            >
              Refresh
            </button>
          </div>
          <div className={`max-h-96 overflow-y-auto divide-y ${variantClasses.panelDivider}`}>
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-600">
                <FiLoader className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : notificationItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">No notifications yet.</div>
            ) : (
              notificationItems.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onClick={handleNotificationClick}
                  variant={variantClasses}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
