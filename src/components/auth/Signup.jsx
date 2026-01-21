import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Flag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FloatingInput from '../input/FloatingInput';
import { Spinner } from 'flowbite-react';
import loginimg from '../../assets/login.png'

export default function Signup() {
    const [toast, setToast] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        // const emailRegex = /^[^\s@]+@1cloudng\.com$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

        // if(!emailRegex.test(form.email)) {
        //     alert("Email must end with @1cloudng.com");
        //     return;
        // }

        if (!passwordRegex.test(form.password)) {
            setToast({
                type: "error",
                message: "Passowrd must be at least 8 characters long, contain 1 uppercase, 1lowercase and 1 special character!"
            })
            return;
        }

        if (form.password !== form.confirm) {
            setToast({
                type: "error",
                message: "Passwords do not match!"
            })
            return;
        }

        try {
            const { data, error } = await signUp({
                email: form.email,
                password: form.password,
                full_name: form.full_name
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    setToast({
                        type: "error",
                        message: "User already exists!"
                    })
                } else {
                    setToast({
                        type: "error",
                        message: error.message
                    })
                }
                return;
            }

            setToast({
                type: "success",
                message: "Account created successful! Check your email!"
            })
            navigate('/login')
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
                        <img src={logo} alt="" className='w-30 mb-8' />
                    </div>
                    <div className='ps-20'>
                        <h1 className='font-bold text-[35px] mb-2'> Create Your Account</h1>
                        <p className='text-[#26599F] mb-8'> Sign up to access inventory records, requests, and approvals.</p>

                        <form action="" method='post' onSubmit={handleSubmit}>
                            <FloatingInput
                                type="text"
                                name='full_name'
                                value={form.full_name}
                                onChange={handleChange}
                                label="Name"
                            // autoComplete='off'
                            />

                            <FloatingInput
                                type="email"
                                name='email'
                                value={form.email}
                                onChange={handleChange}
                                label="Email"
                            // autoComplete='off'
                            />

                            <div className="mb-4">

                                <div className="relative">

                                    <FloatingInput
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        label="Password"
                                    // autoComplete='new-password'
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

                            <div className="mb-10">

                                <div className="relative">

                                    <FloatingInput
                                        type={showConfirm ? "text" : "password"}
                                        name='confirm'
                                        value={form.confirm}
                                        onChange={handleChange}
                                        label="Confirm Password"
                                    // autoComplete='new-password'
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-48 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>


                            <button type='submit' className='mb-3 bg-[#26599F] px-4 text-white font-bold border-blue-600 hover:bg-blue-900 focus:ring-blue-500 py-2 rounded-md' size='lg' disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>

                            <p className='text-start'>Already have an account? <Link to="/login" className='text-[#26599F] font-bold'>Login</Link> </p>
                        </form>
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center'>
                    <div>
                        <img src={loginimg} alt="" className='w-full h-full object-cover' />
                    </div>

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