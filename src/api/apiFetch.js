import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const apiFetch = async (url, method, isAdmin = false, body = null) => {
  const token = document.cookie
    .replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1')
    .trim();

  if (!token && isAdmin && body) return;

  const headers = new Headers({ 'Content-Type': 'application/json' });

  if (isAdmin) headers.append('Authorization', token);

  const options = {
    method,
    headers,
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);

    if (!response.ok) throw new Error('Failed to fetch');

    return await response.json();
  } catch (error) {
    Toast.fire({
      icon: 'error',
      title: `${error.response.data.message}`,
    });
  }
};
