from django.conf import settings
from django.core.mail import send_mail


def notify_staff_new_order(order):
    if not settings.STAFF_NOTIFICATION_EMAILS:
        return

    lines = [
        f"New web order: {order.order_number}",
        f"From: {order.contact_name} ({order.business_name or 'individual'})",
        f"Phone: {order.phone}   Email: {order.email}",
        f"Total: PHP {order.total}",
        "",
        "Items:",
    ]
    for item in order.items.all():
        lines.append(f"  - {item.product_name} x {item.quantity} = PHP {item.line_total}")
    lines += ["", f"Delivery address: {order.delivery_address}"]
    if order.notes:
        lines += ["", f"Notes: {order.notes}"]

    send_mail(
        subject=f"[ValueCare] New order {order.order_number}",
        message="\n".join(lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=settings.STAFF_NOTIFICATION_EMAILS,
        fail_silently=True,
    )


def notify_staff_new_message(message):
    if not settings.STAFF_NOTIFICATION_EMAILS:
        return

    body = (
        f"From: {message.name} <{message.email}>\n"
        f"Phone: {message.phone or '-'}\n"
        f"Subject: {message.subject or '(none)'}\n\n"
        f"{message.message}"
    )
    send_mail(
        subject=f"[ValueCare] New contact message: {message.subject or 'General inquiry'}",
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=settings.STAFF_NOTIFICATION_EMAILS,
        fail_silently=True,
    )