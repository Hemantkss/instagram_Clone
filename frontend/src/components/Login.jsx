/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const { user } = useSelector((store) => store.auth);
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const changeEventHandler = async (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const submitEventHandler = async (e) => {
    e.preventDefault();
    // API call to submit the form
    try {
      //console.log(input);
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }

  }, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={submitEventHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div>
          <h1 className=" text-xl font-bold mb-1 text-center">Instagram</h1>
          <p className="text-sm text-center text-zinc-500">
            Login to see photos and videos from your friends.
          </p>
        </div>
        <div>
          <Label className="font-medium">Email</Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter Your Email"
            className="my-1 focus-visible:ring-transparent"
            required
          />
        </div>
        <div>
          <Label className="font-medium">Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Enter Your Password"
            className="my-1 focus-visible:ring-transparent"
            required
          />
        </div>
        {loading ? (
          <Button className="bg-blue-400 hover:bg-blue-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </Button>
        ) : (
          <Button className="bg-blue-400 hover:bg-blue-600" type="submit">
            Login
          </Button>
        )}

        <span className="text-center">
          Don&apos;t have an account?
          <Link to="/signup" className="text-blue-600">
            &nbsp; Sign Up
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
