import { useAuthStore } from "../../store/auth";
import { useFormik } from "formik";
import * as yup from "yup";

export const Login = () => {

    const {startLogin, errorMessage} = useAuthStore();

    const validationSchema = yup.object().shape({
        email: yup.string().email("Email is invalid").required("Email is required"),
        password: yup.string().required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema,
        onSubmit: (values) => {
            startLogin(values);
        },
    });

    return (
        <div className="container-login">
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" value={formik.values.email} onChange={formik.handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" value={formik.values.password} onChange={formik.handleChange} />
                    </div>  
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}