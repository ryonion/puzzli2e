import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "firebase.js";
import { updatePlan } from "components/common/plan_fb";

function handleUpload(file, setPercent, userId, planId, setError) {
  if (!file) {
    alert("Please choose a file first!");
  }

  const storageRef = ref(storage, `/files/${userId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );

        // update progress
        setPercent(percent);
      },
      (err) => setError(err),
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          updatePlan(planId, "imageUrl", url);
        });
      },
  );
};

export default handleUpload;
