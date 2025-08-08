import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';
import { ImageInput } from '@/components/image-input';
import type { IImageInputFile } from '@/components/image-input';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthContext, UserModel } from '@/auth';

const CrudAvatarUpload = () => {
  const [avatar, setAvatar] = useState<IImageInputFile[]>([
    { dataURL: toAbsoluteUrl(`/media/avatars/blank.png`) }
  ]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { currentUser, setCurrentUser, saveAuth }: any = useAuthContext();

  useEffect(() => {
    if (currentUser.ProfilResmi) {
      setAvatar([{ dataURL: `${API_URL+currentUser.ProfilResmi}` }])
    }
  }, [currentUser.ProfilResmi])

  const handleImageUpload = async (selectedAvatar: IImageInputFile[]) => {
    try {
      // Giriş doğrulama
      if (!selectedAvatar?.length || !selectedAvatar[0]?.dataURL) {
        toast.error('Lütfen geçerli bir resim seçin');
        return;
      }

      setLoading(true);

      // Base64'ten Blob'a dönüştürme
      const dataURL = selectedAvatar[0].dataURL;
      const base64Data = dataURL.split(',')[1];

      if (!base64Data) {
        throw new Error('Geçersiz resim formatı');
      }

      // Dosya tipini kontrol et
      const fileType = dataURL.split(';')[0].split('/')[1];
      const allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'];

      if (!allowedTypes.includes(fileType)) {
        toast.error('Desteklenmeyen dosya formatı');
        return;
      }

      // Blob oluştur
      const blob = await fetch(dataURL).then(res => res.blob());

      // Dosya boyutunu kontrol et (2MB)
      if (blob.size > 2 * 1024 * 1024) {
        toast.error('Dosya boyutu 2MB\'dan büyük olamaz');
        return;
      }

      // FormData oluştur
      const formData = new FormData();
      formData.append('image', blob, `avatar.${fileType}`); // Backend'deki field name ile eşleştir

      // API isteği
      const response = await axios.post(
        `${API_URL}/auth/user-avatar-update`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true // JWT için
        }
      );
      if (response.data) {
        setTimeout(() => {
          setAvatar([{ dataURL: `${API_URL + response.data}?v=${Date.now()}` }]);
          setCurrentUser((prev: UserModel) => ({
          ...prev,
          ProfilResmi: `${response.data}?v=${Date.now()}`
        }));
        }, 300);
        
        toast.success('Profil resmi başarıyla güncellendi');
      }

    } catch (error: any) {
      console.error('Avatar yükleme hatası:', error);

      // Hata mesajlarını özelleştir
      const errorMessage = error?.response?.data?.message
        ? error.response.data.message
        : error?.message
          ? error.message
          : 'Avatar yüklenirken bir hata oluştu';

      toast.error(errorMessage);

      // Varsayılan avatar'a dön
      setAvatar([{
        dataURL: toAbsoluteUrl('/media/avatars/blank.png')
      }]);

    } finally {
      setLoading(false);
    }
  };
  
  const handleImageDelete = async () => {
    if (!currentUser.ProfilResmi || currentUser.ProfilResmi.length === 0) {
      toast.error('Profil resmi bulunamadı');
      return;
    }
    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/delete-avatar`, {});

      if (response.status === 200 || response.status === 201) {
        setAvatar([{ dataURL: toAbsoluteUrl(`/media/avatars/blank.png`) }]);
        toast.success('Profil resmi başarıyla silindi');
      }
    } catch (error: any) {
      console.error('Resim silme hatası:', error);
      toast.error(error?.response?.data?.message || 'Resim silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageInput
      value={avatar}
      onChange={handleImageUpload}
    >
      {({ onImageUpload }) => (
        <div className="image-input size-16" onClick={onImageUpload}>
          {loading && (
            <div className="absolute inset-0 bg-gray-500/50 rounded-full flex items-center justify-center z-10">
              <KeenIcon icon="loading" className="text-white animate-spin" />
            </div>
          )}
          <div
            className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-5 -top-0.5 -end-0.5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleImageDelete();
            }}
          >
            <KeenIcon icon="cross" />
          </div>
          <span className="tooltip" id="image_input_tooltip">
            Kaldırmak veya geri dönmek için tıklayın
          </span>

          <div
            className="image-input-placeholder rounded-full border-2 border-success image-input-empty:border-gray-300"
            style={{ backgroundImage: `url(${toAbsoluteUrl(`/media/avatars/blank.png`)})` }}
          >
            {avatar.length > 0 && <img src={avatar[0].dataURL} alt="avatar" className='w-full h-full obcect-cover' />}

            <div className="flex items-center justify-center cursor-pointer h-5 left-0 right-0 bottom-0 bg-dark-clarity absolute">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="12"
                viewBox="0 0 14 12"
                className="fill-light opacity-80"
              >
                <path
                  d="M11.6665 2.64585H11.2232C11.0873 2.64749 10.9538 2.61053 10.8382 2.53928C10.7225 2.46803 10.6295 2.36541 10.5698 2.24335L10.0448 1.19918C9.91266 0.931853 9.70808 0.707007 9.45438 0.550249C9.20068 0.393491 8.90806 0.311121 8.60984 0.312517H5.38984C5.09162 0.311121 4.799 0.393491 4.5453 0.550249C4.2916 0.707007 4.08701 0.931853 3.95484 1.19918L3.42984 2.24335C3.37021 2.36541 3.27716 2.46803 3.1615 2.53928C3.04584 2.61053 2.91234 2.64749 2.7765 2.64585H2.33317C1.90772 2.64585 1.49969 2.81486 1.19885 3.1157C0.898014 3.41654 0.729004 3.82457 0.729004 4.25002V10.0834C0.729004 10.5088 0.898014 10.9168 1.19885 11.2177C1.49969 11.5185 1.90772 11.6875 2.33317 11.6875H11.6665C12.092 11.6875 12.5 11.5185 12.8008 11.2177C13.1017 10.9168 13.2707 10.5088 13.2707 10.0834V4.25002C13.2707 3.82457 13.1017 3.41654 12.8008 3.1157C12.5 2.81486 12.092 2.64585 11.6665 2.64585ZM6.99984 9.64585C6.39413 9.64585 5.80203 9.46624 5.2984 9.12973C4.79478 8.79321 4.40225 8.31492 4.17046 7.75532C3.93866 7.19572 3.87802 6.57995 3.99618 5.98589C4.11435 5.39182 4.40602 4.84613 4.83432 4.41784C5.26262 3.98954 5.80831 3.69786 6.40237 3.5797C6.99644 3.46153 7.61221 3.52218 8.1718 3.75397C8.7314 3.98576 9.2097 4.37829 9.54621 4.88192C9.88272 5.38554 10.0623 5.97765 10.0623 6.58335C10.0608 7.3951 9.73765 8.17317 9.16365 8.74716C8.58965 9.32116 7.81159 9.64431 6.99984 9.64585Z"
                  fill=""
                />
                <path
                  d="M7 8.77087C8.20812 8.77087 9.1875 7.7915 9.1875 6.58337C9.1875 5.37525 8.20812 4.39587 7 4.39587C5.79188 4.39587 4.8125 5.37525 4.8125 6.58337C4.8125 7.7915 5.79188 8.77087 7 8.77087Z"
                  fill=""
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </ImageInput>
  );
};

export { CrudAvatarUpload };
