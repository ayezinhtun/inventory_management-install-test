import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FloatingInput from '../input/FloatingInput';
import { createTheme, FloatingLabel, Spinner } from 'flowbite-react';
import AppToast from '../toast/Toast';
import loginimg from '../../assets/login.png';

export default function Login() {
    const [toast, setToast] = useState(null);

    const [loading, setLoading] = useState(false);

    const customTheme = createTheme({

    })
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signIn({
                email: form.email,
                password: form.password
            });
            setToast({
                type: "success",
                message: "Login Successfully!"
            })
            navigate('/');
        } catch (error) {
            setToast({
                type: "error",
                message: error.message
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex justify-center'>
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <Spinner size="xl" color="info" aria-label="Logging out..." />
                </div>
            )}
            <div className='w-full grid grid-cols-2 gap-20'>

                <div className='flex flex-col'>
                    <div className='m-5'>
                        <img src={logo} alt="" className='w-30 mb-13' />
                    </div>
                    <div className='ps-20'>
                        <h1 className='text-[#26599F] font-bold text-[30px] mb-2'>Hello,</h1>
                        <p className='font-bold text-[35px]'>Welcome Back</p>
                        <p className='text-[#26599F] mb-10'> Sign in to access the inventory management platform.</p>

                        <form action="" onSubmit={handleSubmit}>
                            <FloatingInput
                                type='email'
                                name='email'
                                value={form.email}
                                onChange={handleChange}
                                label="Email"
                            />

                            <div className="mb-10">

                                <div className="relative">
                                    <FloatingInput
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        label="Password"
                                    />


                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-48 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>


                            <button
                                type='submit'
                                className='mb-3 bg-[#26599F] px-4 text-white font-bold border-blue-600 hover:bg-blue-900 focus:ring-blue-500 py-2 rounded-md'
                                size='lg'
                            >
                                Log in
                            </button>

                            <p className='text-start'>Not registered yet? <Link to="/signup" className='text-[#26599F] font-bold'>Sign Up</Link> </p>
                        </form>
                    </div>

                </div>


                <div className='flex flex-col items-center justify-center'>
                
                        <img src={loginimg} alt="" className='w-full h-full object-cover' />
                    
                </div>

            </div>

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <AppToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </div>
    )
}