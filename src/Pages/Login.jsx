import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from './../Utils/api';

function Login() {
    const [getuser, setgetuser] = useState({
        email: '',
        password: ''
    })
    const [error, seterror] = useState('')

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target
        setgetuser(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    // stop the user to go back after login on go to login after logout
    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
            navigate("/navbar");
        }
    }, [navigate]);



    const handleSubmit = async (e) => {
        e.preventDefault()


        try {
            const res = await api.post('/users/login', getuser)
            // console.log("Response from backend:", res);
            seterror('')
            if (res.data.success) {
                localStorage.setItem("isLoggedIn", "true");
                navigate('/navbar')
            } else {
                seterror(res.data.message || "Login failed");
            }

        } catch (error) {
            const errMsg =
                error.response?.data?.message ||
                "Something went wrong! Please try again.";

            console.log("Login error:", errMsg);
            seterror(errMsg);
        }
    }

    return (

        <div className=" min-h-screen sm:flex sm:justify-center sm:items-center">


            <div className="bg-white p-8 sm:p-6 rounded-none sm:rounded-xl sm:shadow-2xl 
                    w-full max-w-none sm:max-w-md text-center 
                    min-h-screen sm:min-h-0
                    transition-all duration-300 ease-in-out ">

                <div className="mb-6">
                    <h2 className=" text-2xl sm:text-3xl font-semibold text-gray-700">
                        Pcat Login
                    </h2>
                </div>



                {/* Form */}
                <form id="login-form" onSubmit={handleSubmit}>


                    <div className="mb-5 text-left">
                        <label htmlFor="email" className="block mb-2 font-semibold text-gray-600 text-sm">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            onChange={handleChange}
                            value={getuser.email}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg box-border text-base
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-300"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-2 text-left">
                        <label htmlFor="password" className="block mb-2 font-semibold text-gray-600 text-sm">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Your Password"
                            onChange={handleChange}
                            value={getuser.password}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg box-border text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-300"
                        />
                    </div>
                    <p className=" text-start text-red-500">{error}</p>

                    <div className="flex justify-between items-center mb-6 text-sm">

                        <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-300">
                            Forgot Password?
                        </a>
                    </div>


                    <button
                        type="submit"
                        className="w-full py-3.5 border-none rounded-lg bg-blue-600 text-white text-lg font-semibold
                    cursor-pointer transition-all duration-300 ease-in-out
                    hover:bg-blue-700 sm:hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;