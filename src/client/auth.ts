declare const $: any;
declare const bootstrap: any;

interface User {
  _id?: string;
  name?: string;
  email: string;
}

// تعديل الواجهة لتطابق استجابة السيرفر
interface LoginResponse {
  status: string;      // 'success'
  message: string;
  token?: string;
  user: User;
}

export function initAuth(): void {
  // 1. فحص وجود جلسة سابقة عند تحميل الصفحة
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      updateAuthUI(JSON.parse(savedUser));
    } catch (e) {
      console.error('فشل في قراءة بيانات الجلسة الحالية', e);
    }
  }

  // 2. الاستماع لإرسال فورم تسجيل الدخول عبر AJAX
  $('#loginForm').on('submit', function (e: any) {
    e.preventDefault();

    const email = ($('#email').val() as string).trim();
    const password = ($('#password').val() as string).trim();
    const $alert = $('#loginAlert');
    const $btn = $('#loginSubmitBtn');

    $alert.addClass('d-none').removeClass('alert-danger alert-success');
    $btn.prop('disabled', true).text('جاري التحقق...');

    $.ajax({
      url: '/api/login',
      method: 'POST',

      contentType: 'application/json',
      data: JSON.stringify({ email, password }),
      success: function (res: LoginResponse) {
        // حفظ بيانات الجلسة
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        localStorage.setItem('user', JSON.stringify(res.user));

        // إخفاء المودال
        const modalEl = document.getElementById('loginModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modalInstance.hide();
        }

        // إعطاء أثر بصري وتنظيف الحقول
        ($('#loginForm')[0] as HTMLFormElement).reset();
        $btn.prop('disabled', false).text('دخول');

        // تحديث الهيدر ديناميكياً
        updateAuthUI(res.user);
      },
      error: function (xhr: any) {
        // استخراج رسالة الخطأ القادمة من السيرفر أو الخطأ الافتراضي
        const errorMsg = xhr.responseJSON?.message || 'حدث خطأ في الاتصال بالسيرفر';
        $alert.removeClass('d-none').addClass('alert-danger').text(errorMsg);
        $btn.prop('disabled', false).text('دخول');
      }
    });
  });

  // 3. الاستماع لتسجيل الخروج
  $(document).on('click', '#logoutBtn', function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    resetAuthUI();
  });
}

// دالة تحديث الواجهة عند تسجيل الدخول
function updateAuthUI(user: User): void {
  // استخدام الاسم إذا توفر أو الجزء الأول من الإيميل
  const displayName = user.name || user.email.split('@')[0];

  $('#authSection').html(`
    <div class="d-flex align-items-center gap-3">
      <span class="text-success fw-bold">مرحباً، ${displayName}</span>
      <button id="logoutBtn" class="btn btn-sm btn-outline-danger">تسجيل خروج</button>
    </div>
  `);
}

// دالة إعادة الواجهة للوضع الافتراضي عند الخروج
function resetAuthUI(): void {
  $('#authSection').html(`
    <button class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#loginModal">
      تسجيل الدخول
    </button>
  `);
}