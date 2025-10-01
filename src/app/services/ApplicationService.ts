import { Application } from "@/types/application";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export const fetchApplications = async (setLoading: SetState<boolean>, setError: SetState<string | null>,setApplications: SetState<Application[]>) => {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
            setApplications(data);
        } else {
            throw new Error('Format de données invalide');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        console.error('Erreur lors du chargement des applications:', err);
    } finally {
        setLoading(false);
    }
};