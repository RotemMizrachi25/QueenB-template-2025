import { useParams, useNavigate } from "react-router-dom";
import MentorDetails from "../components/MentorDetails/MentorDetails";

export default function MentorPage() {
    const { id } = useParams();
    const nav = useNavigate();
    if (!id) return null;
    return <MentorDetails mentorId={id} onClose={() => nav(-1)} />;
}