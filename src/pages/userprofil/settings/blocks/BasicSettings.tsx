import { CrudAvatarUpload } from '@/partials/crud';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { KeenIcon } from '@/components';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/auth/useAuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { UserModel } from '@/auth';
import { toAbsoluteUrl } from '@/utils';

const BasicSettings = ({ userValues, setUserValues, setInfoFunc }: any) => {

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="basic_settings">
        <h3 className="card-title">Temel Ayarlar</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">Profil resmi</label>
          <div className="flex items-center justify-between flex-wrap grow gap-2.5">
            <span className="text-2sm font-medium text-gray-600">150x150px JPEG, PNG Image</span>
            <CrudAvatarUpload />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">Ad Soyad</label>
            <input
              className="input"
              type="text"
              value={userValues?.user?.AdSoyad}
              onChange={(e) => setUserValues({ ...userValues, user: { ...userValues.user, AdSoyad: e.target.value } })}
            />
          </div>
        </div>

        {/* <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">Birth Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="date"
                  className={cn(
                    'input data-[state=open]:border-primary',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <KeenIcon icon="calendar" className="-ms-0.5" />
                  {date ? format(date, 'LLL dd, y') : <span>Pick a date</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="single" // Single date selection
                  defaultMonth={date}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div> */}

        {/*  <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">Company</label>
            <input
              className="input"
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
            />  
          </div>
        </div> */}

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">Telefon Numarası</label>
            <input
              className="input"
              type="text"
              placeholder="Telefon numarası giriniz"
              value={userValues?.user?.Telefon || ''}
              onChange={(e) => { setUserValues({ ...userValues, user: { ...userValues.user, Telefon: e.target.value } }) }}
            />
          </div>
        </div>

        {/* <div className="flex items-center flex-wrap gap-2.5">
          <label className="form-label max-w-56">Visibility</label>

          <div className="grow">
            <Select defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Public</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
                <SelectItem value="3">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div> */}

        {/* <div className="flex items-center flex-wrap gap-2.5">
          <label className="form-label max-w-56">Avaibality</label>
          <div className="grow">
            <label className="switch">
              <span className="switch-label">Available to hire</span>
              <input type="checkbox" defaultChecked value="1" readOnly />
            </label>
          </div>
        </div> */}

        <div className="flex justify-end pt-2.5">
          <button onClick={setInfoFunc} className="btn btn-primary">Değişiklikleri Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export { BasicSettings };
