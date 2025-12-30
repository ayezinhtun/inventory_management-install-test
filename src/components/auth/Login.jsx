import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FloatingInput from '../input/FloatingInput';
import { createTheme, FloatingLabel } from 'flowbite-react';

export default function Login() {
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

        try {
            await signIn({
                email: form.email,
                password: form.password
            });
            alert('login successful');
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='bg-[#EDECEC] rounded-sm shadow-sm p-12 w-full max-w-6xl grid grid-cols-2 gap-20'>

                <div className='flex flex-col justify-center px-10'>
                    <h1 className='text-[#26599F] font-bold text-[40px] mb-2'>Log In</h1>
                    <p className='font-bold text-[20px] mb-8'>See Your Growth and Get Support!</p>

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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>


                        <button type='submit' className='w-full mb-3 bg-[#26599F] text-white font-bold text-[24px] border-blue-600 hover:bg-blue-900 focus:ring-blue-500 py-2 rounded-xl' size='lg'>Log in</button>

                        <p className='text-center'>Not registered yet? <Link to="/signup" className='text-[#26599F] font-bold'>Sign Up</Link> </p>
                    </form>

                </div>

                <div className='flex flex-col items-center justify-center'>
                    <div>
                        <img src={logo} alt="" className='h-[100px] mb-10' />
                        <p className='text-[20px] mt-3 font-bold'>Welcome Back!</p>
                    </div>

                </div>

            </div>
        </div>
    )
}