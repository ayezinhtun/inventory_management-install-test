import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Flag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FloatingInput from '../input/FloatingInput';
import { Spinner } from 'flowbite-react';

export default function Signup() {
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
            alert("Passowrd must be at least 8 characters long, contain 1 uppercase, 1lowercase and 1 special character");
            return;
        }

        if (form.password !== form.confirm) {
            alert('Passwords do not match');
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
                    alert("User already exists");
                } else {
                    alert(error.message);
                }
                return;
            }

            alert("Account created successful! Check your email");
            navigate('/login')
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center'>
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <Spinner size="xl" color="info" aria-label="Logging out..." />
                </div>
            )}
            <div className='bg-[#EDECEC] rounded-sm shadow-sm p-12 w-full max-w-6xl grid grid-cols-2 gap-20'>

                <div className='flex flex-col items-center justify-center'>
                    <div>
                        <img src={logo} alt="" className='h-[100px] mb-10' />
                        <p className='text-[20px] mt-3 font-bold'>Welcome To Inventory Management!</p>
                    </div>

                </div>

                <div className='flex flex-col justify-center px-10'>
                    <h1 className='text-[#26599F] font-bold text-[40px] mb-2'>Sign Up</h1>
                    <p className='font-bold text-[20px] mb-8'>See Your Growth and Get Support!</p>

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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>


                        <button type='submit' className='w-full mb-3 bg-[#26599F] text-white font-bold text-[24px] border-blue-600 hover:bg-blue-900 focus:ring-blue-500 py-2 rounded-xl' size='lg' disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>

                        <p className='text-center'>Already have an account? <Link to="/login" className='text-[#26599F] font-bold'>Login</Link> </p>
                    </form>

                </div>

            </div>
        </div>
    )
}