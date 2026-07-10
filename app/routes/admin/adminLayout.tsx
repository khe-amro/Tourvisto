import {Outlet} from "react-router";
import {SidebarComponent} from"@syncfusion/ej2-react-navigations"
import { MobileSideBar, NavItems } from "../../../components";

const AdminLayout = () => {
  return (
    <div className='admin-layout'>
      <MobileSideBar />
      <aside className=' w-fill max-w-[270px] hidden lg:block'>
          <SidebarComponent width={270} enableGestures={false}>
             <NavItems/>
          </SidebarComponent>
      </aside>

        <aside className="children lg:ml-[270px]">
            <Outlet/>
        </aside>
    </div>
  )
}

export default AdminLayout