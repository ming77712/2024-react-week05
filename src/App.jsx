import { useState, useEffect, useRef } from 'react';
import ReactLoading from 'react-loading';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import * as bootstrap from 'bootstrap';
import validate from 'validate.js';
import { useForm } from 'react-hook-form';
import { apiFetch } from './api/apiFetch';
import Pagination from './component/Pagination';

import './assets/style.css';

import { currency } from './utils/filter';

const { VITE_URL, VITE_PATH } = import.meta.env;

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

function App() {
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [pagination, setPagination] = useState({});
  const [cart, setCart] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(1);
  const productModalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const openModal = async (id) => {
    productModalRef.current.show();
    setLoadingProductId(id);
    getProduct(id);
    setLoadingProductId(null);
  };

  const validateForm = (data) => {
    const validationErrors = validate(data);
    return validationErrors || {};
  };

  useEffect(() => {
    getProducts();
    getCart();
  }, []);

  useEffect(() => {
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false,
    });
  }, []);

  //API
  const getProducts = async (page = 1) => {
    const url = `${VITE_URL}/api/${VITE_PATH}/products?page=${page}`;
    const res = await apiFetch(url, 'GET');
    setProducts(res.products);
    setPagination(res.pagination);
  };

  const getProduct = async (id) => {
    const url = `${VITE_URL}/api/${VITE_PATH}/product/${id}`;
    const res = await apiFetch(url, 'GET');
    setProduct(res.product);
  };

  const getCart = async () => {
    const url = `${VITE_URL}/api/${VITE_PATH}/cart`;
    const res = await apiFetch(url, 'GET');
    setCart(res.data);
  };

  const addCart = async (id, num) => {
    setLoadingCartId(id);
    const product = {
      data: {
        product_id: id,
        qty: num,
      },
    };

    const url = `${VITE_URL}/api/${VITE_PATH}/cart`;
    const res = await apiFetch(url, 'POST', false, product);

    Toast.fire({
      icon: 'success',
      title: `${res.message}`,
    });

    getCart();

    setLoadingCartId(null);
    productModalRef.current.hide();
  };

  const updateCart = async (id, qty = 1) => {
    const product = {
      data: {
        product_id: id,
        qty,
      },
    };

    const url = `${VITE_URL}/api/${VITE_PATH}/cart/${id}`;
    const res = await apiFetch(url, 'PUT', false, product);

    Toast.fire({
      icon: 'success',
      title: `${res.message}`,
    });

    getCart();
  };

  const deleteCart = async (id) => {
    setLoadingDeleteId(id);
    const url = `${VITE_URL}/api/${VITE_PATH}/cart/${id}`;
    const res = await apiFetch(url, 'Delete');

    Toast.fire({
      icon: 'success',
      title: `${res.message}`,
    });

    getCart();

    setLoadingDeleteId(null);
  };

  const deleteCartAll = async () => {
    const url = `${VITE_URL}/api/${VITE_PATH}/carts`;
    const res = await apiFetch(url, 'Delete');

    Toast.fire({
      icon: 'success',
      title: `${res.message}`,
    });

    getCart();
  };

  const onSubmit = async (data) => {
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length === 0) {
      const url = `${VITE_URL}/api/${VITE_PATH}/order`;
      const res = await apiFetch(url, 'POST', false, {
        data: { user: data, message: data.message },
      });

      Toast.fire({
        icon: 'success',
        title: `${res.message}`,
      });

      reset();
      getCart();
    }
  };

  return (
    <div className='container'>
      <div className='mt-4'>
        <div className='modal' id='productModal' ref={productModalRef}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>產品名稱：{product.title}</h5>
                <button
                  type='button'
                  className='btn-close'
                  data-bs-dismiss='modal'
                  aria-label='Close'
                ></button>
              </div>
              <div className='modal-body'>
                <img className='w-100' src={product.imageUrl} />
                <p className='mt-3'>產品內容：{product.content}</p>
                <p>產品描述：{product.description}</p>
                <p>
                  價錢：<del>原價 ${product.origin_price}</del>，特價：$
                  {product.price}
                </p>
                <div className='d-flex align-items-center'>
                  <label style={{ width: '150px' }}>購買數量：</label>
                  <button
                    className='btn btn-danger'
                    type='button'
                    id='button-addon1'
                    aria-label='Decrease quantity'
                    onClick={() =>
                      setCartQuantity((pre) => (pre === 1 ? pre : pre - 1))
                    }
                  >
                    <i className='bi bi-dash-lg'></i>
                  </button>
                  <input
                    className='form-control'
                    type='number'
                    value={cartQuantity}
                    min='1'
                    max='10'
                    onChange={(e) => setCartQuantity(Number(e.target.value))}
                  />
                  <button
                    className='btn btn-primary'
                    type='button'
                    id='button-addon2'
                    aria-label='Decrease quantity'
                    onClick={() => setCartQuantity((pre) => pre + 1)}
                  >
                    <i className='bi bi-plus-lg'></i>
                  </button>
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => addCart(product.id, cartQuantity)}
                >
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        </div>

        <table className='table align-middle'>
          <thead>
            <tr>
              <th>圖片</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ width: '200px' }}>
                  <div
                    style={{
                      height: '100px',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: `url(${product.imageUrl})`,
                    }}
                  />
                </td>
                <td>{product.title}</td>
                <td>
                  <del className='h6'>
                    原價： {currency(product.origin_price)} 元
                  </del>
                  <div className='h5'>特價： {currency(product.price)} 元</div>
                </td>
                <td>
                  <div className='btn-group btn-group-sm'>
                    <button
                      className='btn btn-outline-secondary'
                      onClick={() => openModal(product.id)}
                      disabled={loadingProductId === product.id}
                    >
                      {loadingProductId === product.id ? (
                        <ReactLoading
                          type='spin'
                          color='#6c757d'
                          height={20}
                          width={20}
                        />
                      ) : (
                        '查看更多'
                      )}
                    </button>
                    <button
                      type='button'
                      className='btn btn-outline-danger'
                      onClick={() => addCart(product.id, 1)}
                      disabled={loadingCartId === product.id}
                    >
                      {loadingCartId === product.id ? (
                        <ReactLoading
                          type='spin'
                          color='#dc3545'
                          height={20}
                          width={20}
                        />
                      ) : (
                        '加入購物車'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} changePage={getProducts} />
        <div className='text-end'>
          <button
            className={`btn btn-outline-danger ${
              cart.carts?.length ? '' : 'disabled'
            }`}
            type='button'
            onClick={deleteCartAll}
          >
            清空購物車
          </button>
        </div>
        <table className='table align-middle'>
          <thead>
            <tr>
              <th></th>
              <th>品名</th>
              <th style={{ width: '150px' }}>數量</th>
              <th>單價</th>
            </tr>
          </thead>
          <tbody>
            {cart?.carts &&
              cart?.carts.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button
                      type='button'
                      className='btn btn-outline-danger btn-sm'
                      onClick={() => deleteCart(item.id)}
                      disabled={loadingDeleteId === item.id}
                    >
                      {loadingDeleteId === item.id ? (
                        <ReactLoading
                          type='spin'
                          color='#dc3545'
                          height={20}
                          width={20}
                        />
                      ) : (
                        <i className='bi bi-x'>刪除</i>
                      )}
                    </button>
                  </td>
                  <td>{item.product.title}</td>
                  <td>
                    <div className='input-group input-group-sm'>
                      <input
                        type='number'
                        className='form-control'
                        min='1'
                        defaultValue={item.qty}
                        key={item.qty}
                        onBlur={(e) =>
                          updateCart(item.id, Number(e.target.value))
                        }
                      />
                    </div>
                  </td>
                  <td className='text-end'>
                    {item.final_total !== item.total && (
                      <small className='text-success'>折扣價：</small>
                    )}
                    {currency(item.final_total)}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan='3' className='text-end'>
                總計
              </td>
              <td className='text-end'>{currency(cart?.total)}</td>
            </tr>
            {cart?.final_total !== cart?.total ? (
              <tr>
                <td colSpan='3' className='text-end text-success'>
                  折扣價
                </td>
                <td className='text-end text-success'>
                  {currency(cart?.final_total)}
                </td>
              </tr>
            ) : (
              ''
            )}
          </tfoot>
        </table>
      </div>

      <div className='my-5 row justify-content-center'>
        <form onSubmit={handleSubmit(onSubmit)} className='col-md-6'>
          <div className='mb-3'>
            <label htmlFor='email' className='form-label'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              className='form-control'
              placeholder='請輸入 Email'
              {...register('email', {
                required: '請輸入 Email。',
                pattern: { value: /^\S+@\S+$/i, message: 'Email 格式不正確。' },
              })}
            />
            {errors.email && (
              <p className='text-danger'>{errors.email.message}</p>
            )}
          </div>

          <div className='mb-3'>
            <label htmlFor='name' className='form-label'>
              收件人姓名
            </label>
            <input
              id='name'
              name='name'
              type='text'
              className='form-control'
              placeholder='請輸入姓名'
              {...register('name', { required: '請輸入收件人姓名。' })}
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='tel' className='form-label'>
              收件人電話
            </label>
            <input
              id='tel'
              name='tel'
              type='tel'
              className='form-control'
              placeholder='請輸入電話'
              {...register('tel', {
                required: '請輸入收件人電話。',
                minLength: {
                  value: 8,
                  message: '電話號碼至少需要 8 碼。',
                },
                pattern: {
                  value: /^\d+$/,
                  message: '電話號碼格式不正確，僅限數字。',
                },
              })}
            />
            {errors.tel && <p className='text-danger'>{errors.tel.message}</p>}
          </div>

          <div className='mb-3'>
            <label htmlFor='address' className='form-label'>
              收件人地址
            </label>
            <input
              id='address'
              name='address址'
              type='text'
              className='form-control'
              placeholder='請輸入地址'
              {...register('address', { required: '請輸入收件人地址。' })}
            />
            {errors.address && (
              <p className='text-danger'>{errors.address.message}</p>
            )}
          </div>

          <div className='mb-3'>
            <label htmlFor='message' className='form-label'>
              留言
            </label>
            <textarea
              id='message'
              className='form-control'
              placeholder='留言'
              cols='30'
              rows='10'
              {...register('message')}
            ></textarea>
          </div>
          <div className='text-end'>
            <button
              type='submit'
              className={`btn btn-danger ${
                cart.carts?.length ? '' : 'disabled'
              }`}
            >
              送出訂單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
