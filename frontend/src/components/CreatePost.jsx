/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { readFileAsdataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imgRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=> store.auth);
  const {posts} = useSelector(store=> store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsdataURL(file);
      setImagePreview(dataUrl);
    }
  };
  const createPostHandler = async () => {
    //console.log(file, caption);
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) {
      formData.append("image", file);
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]))
        toast.success(res.data.message);
        setOpen(false)
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader className="text-center font-semibold">
          Create New Post
        </DialogHeader>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Bio here...</span>
          </div>
        </div>
        <Textarea
          className="focus-visible:ring-transparent border-none "
          placeholder="Write A Caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {imagePreview && (
          <div className="w-full h-64 items-center justify-center">
            <img
              src={imagePreview}
              alt="img"
              className="object-cover w-full h-full rounded-md"
            />
          </div>
        )}
        <Input
          ref={imgRef}
          onChange={fileChangeHandler}
          type="file"
          className="hidden"
        />
        <Button
          onClick={() => imgRef.current.click()}
          className="w-fit mx-auto bg-[#0095f6] hover:bg-[#515be6] "
        >
          Select From Computer
        </Button>
        {imagePreview &&
          (loading ? (
            <Button className="bg-[#f74e4e] hover:bg-[#d33d3d]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full bg-[#f74e4e] hover:bg-[#d33d3d]"
              onClick={createPostHandler}
            >
              Post
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
