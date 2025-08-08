import { useAuthContext } from '@/auth';
import { KeenIcon } from '@/components';
import { CrudAvatarUpload } from '@/partials/crud/CrudAvatarUpload';
import axios from 'axios';
import { toast } from 'sonner';

const GeneralInfo = () => {
  const { currentUser,setCurrentUser } = useAuthContext();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  /* const setAvatarFunc = async(e:any)=>{
      const formData = new FormData();
      formData.append('image',e[0].file)
      const response:any = await axios.post(`${API_URL}/auth/profil-picture-update`,formData);
      if(response){
        if(response.status === 201){
          setCurrentUser(response.data)
        }else{
          toast.error(response?.response?.data ? response?.response?.data?.message : `Update image failed`, { duration: 2000 });
        }
      }
  } */

  return (
    <div className="card min-w-full">
      <div className="card-header">
        <h3 className="card-title">General Info</h3>

        <div className="flex items-center gap-2">
          <label className="switch switch-sm">
            <span className="switch-label">Public Profile</span>
            <input type="checkbox" value="1" name="check" defaultChecked />
          </label>
        </div>
      </div>

      <div className="card-table scrollable-x-auto pb-3">
        <table className="table align-middle text-sm text-gray-500" id="general_info_table">
          <tbody>
          {/* <tr>
              <td className="text-gray-600 font-normal">Profil picture</td>
              <td className="text-gray-800 font-normal">
              <span className="text-2sm text-gray-700">150x150px JPEG, PNG Image</span>
              </td>
              <td className="text-center">
              <CrudAvatarUpload avatar={[{dataURL:currentUser?.profilePicture}]} setAvatar={setAvatarFunc} removeVisible={false} />
              </td>
            </tr> */}
            <tr>
              <td className="min-w-56 text-gray-600 font-normal">Ad Soyad</td>
              <td className="min-w-48 w-full text-gray-800 font-normal">{currentUser?.AdSoyad}</td>
              <td className="min-w-16 text-center">
                <a href="#" className="btn btn-sm btn-icon btn-clear btn-primary">
                  <KeenIcon icon="notepad-edit" />
                </a>
              </td>
            </tr>

            <tr>
              <td className="text-gray-600 font-normal">Telefon</td>
              <td className="text-gray-800 font-normal">{currentUser?.Telefon}</td>
              <td className="text-center">
                <a href="#" className="btn btn-sm btn-icon btn-clear btn-primary">
                  <KeenIcon icon="notepad-edit" />
                </a>
              </td>
            </tr>

           {/*  <tr>
              <td className="text-gray-600 font-normal">VAT number</td>
              <td className="text-gray-800 font-normal">
                <span className="badge badge-sm badge-outline badge-danger">Missing Details</span>
              </td>
              <td className="text-center">
                <a href="#" className="btn btn-link btn-sm">
                  Add
                </a>
              </td>
            </tr> */}

            <tr>
              <td className="text-gray-600 font-normal">Email</td>
              <td className="text-gray-800 font-normal">{currentUser?.Email}</td>
              <td className="text-center">
                <a href="#" className="btn btn-sm btn-icon btn-clear btn-primary">
                  <KeenIcon icon="notepad-edit" />
                </a>
              </td>
            </tr>

            {/* <tr>
              <td className="text-gray-600 font-normal">Remote Company ID</td>
              <td className="text-gray-800 text-2sm font-normal">
                <div className="flex items-center gap-0.5">
                  CID78901BXT2023
                  <button className="btn btn-xs btn-icon btn-clear btn-light">
                    <KeenIcon icon="copy" />
                  </button>
                </div>
              </td>
              <td className="text-center">
                <a href="#" className="btn btn-sm btn-icon btn-clear btn-primary">
                  <KeenIcon icon="notepad-edit" />
                </a>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { GeneralInfo };
